<template>
  <div class="md-layout">
    <div class="md-layout-item">
      <p @click="$router.go(-1)" class="back">back</p>
      <md-card>
        <md-card-content>
          <md-field>
            <label>Name</label>
            <md-input v-model="wifi.name" type="text"></md-input>
          </md-field>
          <md-field>
            <label>password</label>
            <md-input v-model="wifi.password" type="text"></md-input>
          </md-field>
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

export default {
  data() {
    return {
      wifi: {
        name: "",
        password: ""
      }
    };
  },
  created() {
    db.collection("wifi")
      .get()
      .then(snap => {
        if (!snap.empty) {
          this.wifi = snap.docs[0].data();
        } else {
          let ref = db.collection("wifi").doc();
          this.wifi.id = ref.id;
        }
      });
  },
  methods: {
    validate() {
      let valid = true;
      for (let k in this.wifi) {
        if (!this.wifi[k]) {
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
      this.wifi.created = new Date().getTime();
      console.log(this.wifi);
      return db
        .collection("wifi")
        .doc(this.wifi.id)
        .set(vm.wifi, { merge: true })
        .then(() => {
          return Swal.fire("Success", "Wifi Updated", "success");
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
