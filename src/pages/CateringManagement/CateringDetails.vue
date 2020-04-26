<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <md-button @click="$router.go(-1)" >back</md-button>
      <md-card>
        <md-card-content>
          <md-field>
            <label>
              Catering's Name
              <span class="required">*</span>
            </label>
            <md-input v-model="catering.name" type="text"></md-input>
          </md-field>

          <md-field>
            <label>Tags</label>
            <md-chips v-model="catering.tags" md-placeholder="Add keyword...(Press Enter To Add)"></md-chips>
          </md-field>

          <md-field>
            <label>Level</label>
            <md-input v-model="catering.level" type="text"></md-input>
          </md-field>

          <label>Type</label>
          <v-select v-model="catering.types" :options="types" multiple></v-select>

          <label>Contacts</label>
          <md-field v-for="(contact, i) in catering.contacts" :key="i">
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
              :inputData="catering.description"
            />
          </div>

          <label>Details</label>
          <md-field v-for="(detail, index) in catering.details" :key="index">
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
            title="catering Logo"
            :media="catering.logos"
            @saveImages="saveLogo"
            @removeImage="removeLogoImages($event)"
          ></uploadMult>-->
          <div></div>
          <label>Logo</label>
          <upload
            :media_type="'image'"
            title="Logo"
            :media="catering.logo"
            @saveImage="saveLogo"
            @removeImage="catering.logo = null"
          ></upload>

          <label>Menu</label>
          <upload
            :media_type="'image'"
            title="Menu"
            :media="catering.menu"
            @saveImage="saveMenu"
            @removeImage="catering.menu = null"
          ></upload>

          <label>Main Image</label>
          <upload
            :media_type="'image'"
            title="Main Image"
            :media="catering.main_image"
            @saveImage="saveMainImage"
            @removeImage="catering.main_image = null"
          ></upload>

          <!-- <upload
            :media_type="'logos'"
            title="face Image"
            :media="catering.logos"
            @saveMainImage="saveLogo"
            @removeImage="catering.imageface = null"
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
      catering: {
        name: "",
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
      types: ["BREAKFAST", "LUNCH", "DINER", "TO GO"],
      locations: [],
      detailsAmnt: 1
    };
  },
  watch: {
    catering: {
      handler(val) {
        if (!this.catering.created) {
          this.catering.slug = val.name.replace(/[^a-zA-Z0-9]/g, "-");
        }
      },
      deep: true
    }
    // location(val) {
    //   this.catering.location = db.collection("locations").doc(val);
    // }
  },
  firestore() {
    return {
      catering: db.collection("catering").doc(this.$route.params.company_id)
    };
  },

  methods: {
    // saveLogo(logo) {
    //   this.catering.logos.push(logo);
    // },
    // removeLogoImages(img) {
    //   this.catering.logos = this.catering.logos.filter(i => i !== img);
    // },

    removeContact(item) {
      this.catering.contacts = this.catering.contacts.filter(
        c => JSON.stringify(c) !== JSON.stringify(item)
      );
    },

    removeDetail(detail) {
      this.catering.details = this.catering.details.filter(
        (d, i) => d.text !== detail.text
      );
     
    },

    addDetails() {
      this.catering.details.push({ text: null });
    },

    addAnotherContact() {
      this.catering.contacts.push({
        name: null,
        email: null,
        phone: null
      });
    },

    updateData(value, key) {
      this.catering[key] = value;
    },
    saveMainImage(image) {
      this.catering.main_image = image;
    },
    saveMenu(image) {
      this.catering.menu = image;
    },
    saveLogo(image) {
      this.catering.logo = image;
    },
    // saveImages(image) {
    //   this.catering.image.push(image);
    // },
    // removeImage(img) {
    //   this.catering.image = this.catering.image.filter(i => i !== img);
    // },
    //  removeImagface(img) {
    //   this.catering.imageFace = this.catering.imageFace.filter(i => i !== img);
    // },
    validate() {
      let valid = true;
      // for (let b in this.catering) {
      //   if (!this.catering[b]) {
      //     if (
      //       b != "phone" &&
      //       b != "description" &&
      //       b != "logos" &&
      //       b != "none_touch" &&
      //       !this.catering[b]
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
      if (!this.catering.created) {
        this.catering.created = new Date().getTime();
      }
      return db
        .collection("catering")
        .doc(this.$route.params.company_id)
        .set(vm.catering, { merge: true })
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
