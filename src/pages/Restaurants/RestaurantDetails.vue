<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-button @click="$router.go(-1)">back</md-button>
      <md-card>
        <md-card-content>
          <md-field>
            <label>
              Restaurant's Name
              <span class="required">*</span>
            </label>
            <md-input v-model="restaurant.name" type="text"></md-input>
          </md-field>
          <md-field>
            <label>Tags</label>
            <md-chips v-model="restaurant.tags" md-placeholder="Add keyword...(Press Enter To Add)"></md-chips>
          </md-field>
          <md-field>
            <label>Level</label>
            <md-input v-model="restaurant.level" type="text"></md-input>
          </md-field>

          <label>Type</label>
          <v-select v-model="restaurant.types" :options="types" multiple></v-select>

          <label>Contacts</label>
          <md-field v-for="(contact, i) in restaurant.contacts" :key="i">
            <md-input placeholder="Name" v-model="contact.name" type="text"></md-input>
            <md-input placeholder="Email" v-model="contact.email" type="text"></md-input>
            <md-input placeholder="Phone" v-model="contact.phone" type="text"></md-input>
            <md-button
              v-if="i"
              class="md-just-icon md-danger md-simple"
              @click.native="removeContact(contact)"
            >
              <md-icon>close</md-icon>
            </md-button>
          </md-field>
          <md-button class="md-primary md-round md-small" @click="addAnotherContact">Add Another</md-button>

          <div class="ck-editor">
            <CKEditor
              label="Description"
              @updateData="updateData($event, 'description')"
              :inputData="restaurant.description"
            />
          </div>

          <label>Details</label>
          <md-field v-for="(detail, index) in restaurant.details" :key="index">
            <md-input v-model="detail.text" type="text"></md-input>
            <md-button
              v-if="index"
              class="md-just-icon md-danger md-simple"
              @click.native="removeDetail(detail)"
            >
              <md-icon>close</md-icon>
            </md-button>
          </md-field>
          <md-button class="md-primary md-round md-small" @click="addDetails">Add Another</md-button>

          <!-- 
         <uploadMult
            :media_type="'image'"
            title="restaurant Logo"
            :media="restaurant.logos"
            @saveImages="saveLogo"
            @removeImage="removeLogoImages($event)"
          ></uploadMult>-->
           <label>Logo</label>
          <upload
            :media_type="'image'"
            title="Logo"
            :media="restaurant.logo"
            @saveImage="saveLogo"
            @removeImage="restaurant.logo = null"
          ></upload>
           <label>Menu</label>
          <upload
            :media_type="'image'"
            title="Menu"
            :media="restaurant.menu"
            @saveImage="saveMenu"
            @removeImage="restaurant.menu = null"
          ></upload>
           <label>Main Image</label>
          <upload
            :media_type="'image'"
            title="Main Image"
            :media="restaurant.main_image"
            @saveImage="saveMainImage"
            @removeImage="restaurant.main_image = null"
          ></upload>

          <!-- <upload
            :media_type="'logos'"
            title="face Image"
            :media="restaurant.logos"
            @saveMainImage="saveLogo"
            @removeImage="restaurant.imageface = null"
          ></upload>-->
        </md-card-content>
        <md-card-actions md-alignment="space-between">
          <md-button class="md-primary md-round md-small" @click="validate">Save</md-button>
        </md-card-actions>
      </md-card>
    </div>
  </div>
</template>

<script>
import Fuse from "fuse.js";
import { db } from "@/config/firebaseInit";
import Swal from "sweetalert2";
import Upload from "../../components/Inputs/Upload.vue";
import UploadMultiple from "@/components/Inputs/UploadMultiple.vue";
import CKEditor from "@/components/CKEditor.vue";

export default {
  components: {
    upload: Upload,
    uploadMult: UploadMultiple,
    CKEditor
  },
  data() {
    return {
      clients: null,
      tags: [],
      restaurant: {
        name: "",
        tags: [],
        logo: "",
        main_image: "",
        description: "",
        types: [],
        level: "",
        location: "",
        contacts: [
          {
            name: null,
            email: null,
            phone: null
          }
        ],
        details: [{ text: null }] /* Multiple details */,
        menu: "" /** PDF or Image */
      },
      media: [],
      chosenClient: null,
      location: null,
      type_options: [
        { val: "video", text: "Video" },
        { val: "image", text: "Image" },
        { val: "survey", text: "Survey" },
        { val: "iframe", text: "iFrame" }
      ],
      files: [],
      upload_progress: null,
      upload_error: null,
      videos: [],
      types: ["BREAKFAST", "LUNCH", "DINNER", "TO GO"],
      locations: [],
      detailsAmnt: 1
    };
  },
  watch: {
    restaurant: {
      handler(val) {
        if (!this.restaurant.created) {
          this.restaurant.slug = val.name.replace(/[^a-zA-Z0-9]/g, "-");
        }
      },
      deep: true
    }
    // location(val) {
    //   this.restaurant.location = db.collection("locations").doc(val);
    // }
  },
  firestore() {
    return {
      restaurant: db.collection("restaurants").doc(this.$route.params.rest_id)
    };
  },

  methods: {
    // saveLogo(logo) {
    //   this.restaurant.logos.push(logo);
    // },
    // removeLogoImages(img) {
    //   this.restaurant.logos = this.restaurant.logos.filter(i => i !== img);
    // },

    removeContact(item) {
      this.restaurant.contacts = this.restaurant.contacts.filter(
        c => JSON.stringify(c) !== JSON.stringify(item)
      );
    },

    removeDetail(detail) {
      this.restaurant.details = this.restaurant.details.filter(
        (d, i) => d.text !== detail.text
      );
    },

    addDetails() {
      this.restaurant.details.push({ text: null });
    },

    addAnotherContact() {
      this.restaurant.contacts.push({
        name: null,
        email: null,
        phone: null
      });
    },

    updateData(value, key) {
      this.restaurant[key] = value;
    },
    saveMainImage(image) {
      this.restaurant.main_image = image;
    },
    saveMenu(image) {
      this.restaurant.menu = image;
    },
    saveLogo(image) {
      this.restaurant.logo = image;
    },
    // saveImages(image) {
    //   this.restaurant.image.push(image);
    // },
    // removeImage(img) {
    //   this.restaurant.image = this.restaurant.image.filter(i => i !== img);
    // },
    //  removeImagface(img) {
    //   this.restaurant.imageFace = this.restaurant.imageFace.filter(i => i !== img);
    // },
    validate() {
      let valid = true;
      // for (let b in this.restaurant) {
      //   if (!this.restaurant[b]) {
      //     if (
      //       b != "phone" &&
      //       b != "description" &&
      //       b != "logos" &&
      //       b != "none_touch" &&
      //       !this.restaurant[b]
      //     ) {
      //       valid = false;
      //     }
      //   }
      // }

      if (valid) {
        this.save();
      } else {
        alert("Please fill in all fields");
      }
    },
    save() {
      let vm = this;
      if (!this.restaurant.created) {
        this.restaurant.created = new Date().getTime();
      }
      return db
        .collection("restaurants")
        .doc(this.$route.params.rest_id)
        .set(vm.restaurant, { merge: true })
        .then(() => {
          return Swal.fire("Success", "Page Updated", "success");
        });
    }
  },
  created() {},
  mounted() {
    this.fuseSearch = new Fuse(this.tableData, {
      keys: ["contactName", "url"],
      threshold: 0.3
    });
  },
  updated() {}
};
</script>

<style scoped>
/* <style lang="css" scoped> */
.md-card .md-card-actions {
  border: 0;
  margin-left: 20px;
  margin-right: 20px;
}

.md-card.md-theme-default {
  margin-top: 10px;
  background: #ffffff !important;
}

</style>
