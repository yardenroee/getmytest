<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-dialog class="pdf_dialog" :md-active.sync="showDialog" :style="{padding: '20px'}">
        <md-dialog-title>Add File</md-dialog-title>
        <template>
          <label>
            Upload PDF FILE
            <span class="required">*</span>
          </label>
          <div>
            <input type="file" accept="application/pdf" @change="fileChange" />
            <div>
              <pdf class="pdf-renderer" :src="pdf.url" style="display: inline-block; width: 25%"></pdf>
            </div>
          </div>
          <label>Select Floor</label>
          <md-field>
            <md-select v-model="pdf.floor">
              <md-option
                v-for="(floor,i) in floors"
                v-if="floor.available"
                :disabled="!floor.available"
                :key="i"
                :value="floor.floor"
              >{{ floor.floor }}</md-option>
            </md-select>
          </md-field>
        </template>

        <md-dialog-actions>
          <md-button class="md-primary" @click="submit">Submit</md-button>
          <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        </md-dialog-actions>
      </md-dialog>
      <md-card>
        <md-card-content>
          <md-table
            md-fixed-header
            :value="queriedData"
            :md-sort.sync="currentSort"
            :md-sort-order.sync="currentSortOrder"
            :md-sort-fn="customSort"
            class="paginated-table table-striped table-hover"
            id="pdf-table"
            :style="{paddingLeft : '20px', paedingRight: '20px' }"
          >
            <md-table-toolbar>
              <md-field>
                <label for="pdfs">Per page</label>
                <md-select v-model="pagination.perPage" name="pdfs">
                  <md-option
                    v-for="item in pagination.perPageOptions"
                    :key="item"
                    :label="item"
                    :value="item"
                  >{{ item }}</md-option>
                </md-select>
              </md-field>
              <md-button
                class="md-primary md-round md-small"
                @click="showDialog = true"
              >Add Floor Info</md-button>
              <md-field>
                <md-input
                  type="search"
                  class="mb-3"
                  clearable
                  style="width: 200px"
                  placeholder="Search records"
                  v-model="searchQuery"
                ></md-input>
              </md-field>
            </md-table-toolbar>

            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Icon">
                <md-button
                  class="md-just-icon md-warning md-simple"
                  @click.native="openLink(item.url)"
                >
                  <md-icon>picture_as_pdf</md-icon>
                </md-button>
              </md-table-cell>
              <md-table-cell md-label="Title" md-sort-by="name">{{ item.name }}</md-table-cell>
              <md-table-cell md-label="Floor" md-sort-by="floor">{{ item.floor }}</md-table-cell>
              <md-table-cell md-label="Size">{{ convertSize(item.size) }}</md-table-cell>
              <md-table-cell md-label="Created">{{ item.created | format_date }}</md-table-cell>

              <!--              
              <md-table-cell
                md-label="Published"
                md-sort-by="published"
              >{{ item.published ? 'Yes' : 'No' }}</md-table-cell>-->

              <!-- <md-table-cell md-label="Edit">
                <md-button
                  class="md-just-icon md-warning md-simple"
                  @click.native="handleEdit(item)"
                >
                  <md-icon>edit</md-icon>
                </md-button>
              </md-table-cell>-->
              <md-table-cell md-label="Delete">
                <md-button
                  class="md-just-icon md-danger md-simple"
                  @click.native="handleDelete(item)"
                >
                  <md-icon>close</md-icon>
                </md-button>
              </md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>
        <md-card-actions md-alignment="space-between">
          <div class>
            <p class="card-category">Showing {{ from + 1 }} to {{ to }} of {{ total }} entries</p>
          </div>
          <pagination
            class="pagination-no-border pagination-success"
            v-model="pagination.currentPage"
            :per-page="pagination.perPage"
            :total="total"
          ></pagination>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import { Pagination } from "@/components";
import Fuse from "fuse.js";
import { db, storage } from "@/config/firebaseInit";
import Swal from "sweetalert2";
import router from "@/router";
import Upload from "@/components/Inputs/Upload";
import pdf from "vue-pdf";

export default {
  components: {
    Pagination,
    Upload,
    pdf
  },
  computed: {
    /***
     * Returns a page from the searched data or the whole data. Search is performed in the watch section below
     */
    queriedData() {
      let result = this.tableData;
      if (this.searchedData.length > 0) {
        result = this.searchedData;
      }
      return result.slice(this.from, this.to);
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      return this.searchedData.length > 0
        ? this.searchedData.length
        : this.tableData.length;
    }
  },
  data() {
    return {
      currentSort: "name",
      currentSortOrder: "asc",
      showDialog: false,
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [10, 25, 50],
        total: 0
      },
      searchQuery: "",
      propsToSearch: ["title", "fullname", "description"],
      tableData: [],
      floors: [
        {
          floor: "42",
          available: true
        },
        {
          floor: "43",
          available: true
        },
        {
          floor: "44",
          available: true
        },
        {
          floor: "45",
          available: true
        },
        {
          floor: "46",
          available: true
        },
        {
          floor: "47",
          available: true
        },
        {
          floor: "48",
          available: true
        }
      ],
      searchedData: [],
      fuseSearch: null,
      pdf: {
        url: null,
        name: null,
        size: null,
        date: null,
        floor: null,
        uploadedBy: null
      }
    };
  },
  firestore() {
    return {
      tableData: db.collection("safety").orderBy('floor', 'asc')
    };
  },
  methods: {
    removeImage() {
      this.pdf.url = null;
    },
    openLink(slug) {
      window.open(slug, "_blank");
    },
    customSort(value) {
      return value.sort((a, b) => {
        const sortBy = this.currentSort;
        if (this.currentSortOrder === "desc") {
          return a[sortBy].localeCompare(b[sortBy]);
        }
        return b[sortBy].localeCompare(a[sortBy]);
      });
    },
    convertSize(size) {
      if (size > 0 && size <= 999999) {
        return parseFloat(size / 1000).toFixed(2) + " KB";
      } else {
        return parseFloat(size / 1000000).toFixed(2) + " MB";
      }
    },
    addpdf(pdf) {
      this.pdf = pdf;
    },

    addTag() {
      this.pdf.tags.push({ text: null });
    },

    removeTag(tag) {
      this.pdf.tags = this.pdf.tags.filter((t, i) => t.text !== tag.text);
    },

    fileChange(event) {
      let file = event.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = async e => {
        this.pdf.name = file.name.replace(".pdf", "");
        this.pdf.size = file.size;

        let storageRef = storage.ref(`pdf/${file.name}/${Date.now()}`);
        let uploadTask = storageRef.put(file);

        uploadTask.on(
          "state_changed",
          snapshot => {},
          error => {
            alert("could not upload file, please try again.");
          },
          snapshot => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              this.pdf.url = downloadURL;
            });
          }
        );
      };
    },

    // updatePrivacy(item) {
    //   db.collection("safety")
    //     .doc(item.id)
    //     .update({ private: item.private });
    // },

    submit() {
      let ref = db.collection("safety").doc();
      this.pdf.uploadedBy = null;
      this.pdf.date = new Date().getTime();

      ref
        .set(this.pdf)
        .then(() => {
          this.pdf = {
            url: null,
            name: null,
            size: null,
            date: null,
            floor: null
          };
        })
        .then(() => {
          return Swal.fire(
            "Success",
            "Your file has been uploaded!",
            "success"
          );
        })
        .catch(err => {
          return Swal.fire(
            "Error",
            "Your file couldn't be uploaded, Try again later",
            "warning"
          );
        });
    },
    showImage(item) {
      let id = item.id;
    },
    handleDelete(item) {
      Swal.fire({
        title: "Are you sure?",
        text: "You will not be able to undo this",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "DELETE",
        cancelButtonText: "CANCEL"
      }).then(result => {
        if (result.value) {
          return db
            .collection("safety")
            .doc(item.id)
            .delete()
            .then(() => {
              Swal.fire("Deleted!", "The page has been deleted.", "success");
            });
        }
      });
    }
  },

  mounted() {
    // Fuse search initialization.
    this.fuseSearch = new Fuse(this.tableData, {
      keys: ["title", "fullname", "description", "institution"],
      threshold: 0.3
    });
  },
  watch: {
    /**
     * Searches through the table data by a given query.
     * NOTE: If you have a lot of data, it's recommended to do the search on the Server Side and only display the results here.
     * @param value of the query
     */
    searchQuery(value) {
      let result = this.tableData;
      if (value !== "") {
        result = this.fuseSearch.search(this.searchQuery);
      }
      this.searchedData = result;
    },
    tableData() {
      this.tableData.forEach(data => {
        let floorNum = data.floor;
        this.floors = this.floors.map(floor => {
          if (floor.floor == floorNum) {
            floor.available = false;
            return floor;
          } else {
            return floor;
          }
        });
      });
    }
  }
};
</script>

<style lang="css" scoped>
.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}
</style>
