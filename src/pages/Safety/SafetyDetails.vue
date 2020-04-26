<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <p @click="$router.go(-1)" class="back">back</p>
      <md-card>
        <md-card-content>
          <md-field>
            <label>
              Fullname
              <span class="required">*</span>
            </label>
            <md-textarea v-model="post.fullname" md-autogrow md-counter="200"></md-textarea>
          </md-field>
          <md-field>
            <label>
              Title
              <span class="required">*</span>
            </label>
            <md-input v-model="post.title" type="text"></md-input>
          </md-field>

          <md-field>
            <label>
              Description
              <span class="required">*</span>
            </label>
            <md-textarea v-model="post.description" md-autogrow md-counter="200"></md-textarea>
          </md-field>
          <md-field>
            <label>
              Institution
              <span class="required">*</span>
            </label>
            <md-textarea v-model="post.institution" md-autogrow md-counter="200"></md-textarea>
          </md-field>

          <md-field>
            <label>Categories</label>
            <md-select v-model="post.categories" multiple>
              <md-option
                v-for="(category,i) in categories"
                :key="i"
                :value="category"
              >{{ category }}</md-option>
            </md-select>
          </md-field>
          <!-- <div
            v-if="post.hasOwnProperty('needs_approval') && post.needs_approval && !post_rejected"
          >
            <label>Approve Uploaded Post</label>
            <md-field>
              <md-button @click="review(true)">Approve</md-button>
              <md-button @click="review(false)">Reject</md-button>
            </md-field>
          </div>

          <div v-else-if="post_rejected">
            <label>Reason for rejecting post</label>

            <md-field>
              <md-textarea v-model="response"></md-textarea>
            </md-field>
            <md-button @click="sendDocNotification">SEND NOTIFICATION</md-button>
          </div>

          <div v-else>-->
          <label>Publish</label>
          <md-field>
            <md-switch
              @change="publish(post.published)"
              v-model="post.published"
              :value="true"
            >Visible</md-switch>
          </md-field>

          <label>
            Upload PDF FILE
            <span class="required">*</span>
            <p class="required">Limited to one page</p>
          </label>
          <div>
            <input type="file" accept="application/pdf" @change="fileChange" />
            <div @click="openPDF(post.file.url)">
              <pdf
                class="pdf-renderer"
                :src="post.file.url"
                style="display: inline-block; width: 25%"
              ></pdf>
            </div>
          </div>
        </md-card-content>
        <div v-if="post.file.url" class="field">
          <p @click="deleteImg" class="close1">
            <strong>X</strong>
          </p>
        </div>
        <md-card-actions md-alignment="space-between">
          <md-button class="md-primary md-round md-small" @click="validate">Save</md-button>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import Fuse from "fuse.js";
import { db, storage, batch } from "@/config/firebaseInit";
import Swal from "sweetalert2";
import router from "@/router";
import pdf from "vue-pdf";
import axios from "axios";

export default {
  components: {
    pdf
  },
  data() {
    return {
      media: null,
      post: {
        title: null,
        floor: null,
        file: {
          name: null,
          url: null
        }
      },
      logoLoad: false,
      location: null,
      file: null,
      upload_progress: null,
      upload_error: null,
      allPosts: [],
      response: null,
      post_rejected: false,
      categories: [
        "Anticoagulation",
        "Compression",
        "Diagnostic Imaging",
        "Epidemiology",
        "IVC Filters",
        "Lymphedema",
        "Superficial Vein Disease",
        "Venous Education",
        "Venous Obstruction",
        "Venous Thromboembolism",
        "Wound Care"
      ]
    };
  },

  async created() {
    await this.$bind(
      "post",
      db.collection("safety").doc(this.$route.params.post_id)
    );

    if (!this.post) {
      this.post = {
        title: null,
        floor: null,
        file: {
          name: null,
          url: null
        }
      };
    }
  },

  methods: {
    review(action) {
      if (action) {
        db.collection("posts")
          .doc(this.$route.params.post_id)
          .update({ needs_approval: false });
      } else {
        this.post_rejected = true;
      }
    },
    async publish(action) {
      let doc_id = this.post.doc_id ? this.post.doc_id : false;
      await db
        .collection("posts")
        .doc(this.$route.params.post_id)
        .update({ published: action, needs_approval: false });

      if (doc_id) {
        await db
          .collection("doctors")
          .doc(doc_id)
          .update({ post_published: action });
      }
    },
    deleteImg() {
      let file = this.post.file.name;
      var storageRef = storage.ref();

      var fileRef = storage.ref(
        `documents/${this.$route.params.post_id}/${file}.pdf`
      );

      fileRef
        .delete()
        .then(() => {
          this.post.file.url = null;
          this.post.file.name = null;

          db.collection("posts")
            .doc(this.$route.params.post_id)
            .set(this.post, { merge: true });
          return Swal.fire("Success", "File succesfully deleted", "success");
        })
        .catch(function(error) {
          console.log(error);
          return Swal.fire(
            "Failed",
            "Something went wrong! " + error.message,
            "failed"
          );

          // Uh-oh, an error occurred!
        });
    },
    sendDocNotification() {
      let vm = this;
      var data = {
        key: this.mandrillKey(),
        template_name: "venous-symposium-rejected-post",
        template_content: {},
        message: {
          from_email: "Mlescanofeher@ccmcme.com",
          to: [
            {
              email: this.post.email,
              type: "to"
            }
          ],
          global_merge_vars: [
            {
              name: "FNAME",
              content: this.post.fullname
            },
            {
              name: "RESPONSE",
              content: this.response
            }
          ]
        },
        merge: true
      };
      axios
        .post(
          "https://mandrillapp.com/api/1.0/messages/send-template.json",
          data
        )
        .then(res => {
          this.response = null;
          this.post_rejected = false;
          return Swal.fire(
            "Success",
            "An email has been sent to Dr " +
              this.post.fullname +
              " instructing to change PDF",
            "success"
          );
        })
        .catch(error => {
          console.log(error);
          return Swal.fire("Failed", "Something went wrong!" + error, "failed");
        });
    },
    openPDF(url) {
      if (url) {
        window.open(url, "_blank");
      }
    },
    fileChange(event) {
      let file = event.target.files[0];
      let reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = async e => {
        this.post.file.name = file.name.replace(".pdf", "");

        let storageRef = storage.ref(
          `documents/${this.$route.params.post_id}/${file.name}`
        );
        let uploadTask = storageRef.put(file);

        uploadTask.on(
          "state_changed",
          snapshot => {},
          error => {
            alert("could not upload file, please try again.");
          },
          snapshot => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              this.post.file.url = downloadURL;
            });
          }
        );
      };
    },
    dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      return new File([u8arr], filename, { type: mime });
    },
    validate() {
      let valid = true;

      for (let k in this.post) {
        if (
          k != "approved" &&
          k != "order" &&
          k != "clicks" &&
          k != "categories" &&
          k != "published" &&
          k != "created" &&
          k != "doc_id" &&
          k != "created" &&
          k != "description" &&
          k != "needs_approval" &&
          !this.post[k]
        ) {
          valid = false;
        }
      }

      for (let k in this.post.file) {
        if (!this.post.file[k]) {
          valid = false;
        }
      }

      if (valid) {
        this.save();
      } else {
        alert("Please fill in all fields");
      }
    },

    save() {
      let vm = this;
      if (!this.post.created) {
        this.post.created = new Date().getTime();
        this.post.clicks = 0;
      }

      if (!this.post.order) {
        this.post.order = this.allPosts.length + 1;
      }

      return db
        .collection("posts")
        .doc(this.$route.params.post_id)
        .set(vm.post, { merge: true })
        .then(() => {
          return Swal.fire("Success", "Page Updated", "success");
        })
        .then(success => {
          router.push("/post");
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

.upload {
  margin-top: 2.2em;
  display: flex;
}

.pdf-renderer {
  height: 56vh;
  width: 20vw;
  cursor: pointer;
}

.required {
  color: red;
}

.close1 {
  position: absolute;
  right: 10%;
  top: 40%;
  font-size: 20px;
  color: gray;
  cursor: pointer;
  color: red;
}
</style>
