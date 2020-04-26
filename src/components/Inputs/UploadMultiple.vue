<template>
  <div>
    <label>{{label}}</label>
    <div class="upload_holder">
      <transition name="fade">
        <div v-if="!load" class="upload_click" @click="$refs.upload.click()">
          <md-icon>present_to_all</md-icon>
          <p>Click here to upload media.</p>
        </div>
      </transition>

      <!-- <transition name="fade">
        <div v-if="!media.length && load" class="loading">
          <md-icon class="rotate">autorenew</md-icon>
          <p>loading...</p>
        </div>
      </transition>-->

      <!-- <transition name="fade">
        <div v-if="media.length && !load" class="image_success">
          <div class="image_wrapper" v-for="(image, i) in media" :key="i">
            <p @click="$emit('removeImage', image.url)" class="text_btn">X</p>

            <img :src="image.url" :alt="image.name" />
            <video v-if='media_type == "video"' :src="media"></video>
          </div>
        </div>
      </transition> -->

      <input
        ref="upload"
        multiple
        type="file"
        :accept="'image/*'"
        class="hide_upload"
        @change="uploadImages"
      />
    </div>
  </div>
</template>

<script>
import { db, storage } from "@/config/firebaseInit";

export default {
  props: ["label", "media_type", "media", "directory", "currentUser"],
  data() {
    return {
      load: false,
      imageURLs: []
    };
  },
  methods: {
    uploadImages(e) {
      let vm = this;
      this.upload = null;
      vm.load = null;
      setTimeout(function() {
        vm.load = true;
      }, 500);

      let images = Object.values(e.target.files);

      images.map(async (media, i) => {
        let reader = new FileReader();
        let fileName = media.name;
        let fileSize = media.size;

        await reader.readAsDataURL(media);
        reader.onload = await (async e => {
          let storageRef = storage.ref(`${vm.directory}s/${Date.now()}`);
          let uploadTask = storageRef.put(media);

          await uploadTask.on(
            "state_changed",
            snapshot => {},
            error => {
              vm.logoLoad = false;
              alert("could not upload images, please try again.");
            },
            async snapshot => {
              await uploadTask.snapshot.ref
                .getDownloadURL()
                .then(async downloadURL => {
                  let url = downloadURL
                  let media = {};
                  media.url = url;
                  media.name = fileName;
                  media.size = fileSize;
                  media.date = new Date().getTime();
                  media.usage_count = null;
                  media.uploadedBy = this.currentUser;
                  media.tags = [{ text: null }];

                  this.imageURLs.push(media);
                  vm.load = null;
                  setTimeout(function() {
                    vm.load = false;
                  }, 500);

                  if (i == images.length - 1) {
                    this.$emit("uploadImages", this.imageURLs);
                  }
                });
            }
          );
        });
      });
    }
  }
};
</script>

<style lang="css" scoped>
.upload_holder {
  width: 50%;
  padding: 30px;
  background-color: #f7f7f7;
  display: flex;
  justify-content: center;
  align-items: center;
}
.image_wrapper {
  margin-right: 10px;
  position: relative;
}
.text_btn {
  color: white;
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  background: red;
  padding: 5px 10px;
}
.hide_upload {
  position: absolute;
  z-index: -2;
}

.upload_click,
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.upload_click .md-icon {
  font-size: 53px !important;
  opacity: 0.5;
}

.upload_click p {
  line-height: 1.3;
  max-width: 300px;
  text-align: center;
  opacity: 0.5;
  margin-top: 30px;
  margin-bottom: 0;
}

.rotate {
  font-size: 40px !important;
  -webkit-animation: loading 1s infinite linear;
}

.success p {
  text-align: center;
  margin-bottom: 0;
}

.success img {
  width: 100%;
  max-height: 100%;
}

@-webkit-keyframes loading {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
