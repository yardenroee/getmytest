<template>
  <div class="md-layout md-gutter md-alignment-top-left" :class="'main-panel'">
    <SidebarComponent />
    <div class="viewport" :class="'md-layout-item md-size-40'">
      <md-toolbar :md-elevation="1">
        <span class="md-title">Patient Info</span>
      </md-toolbar>

      <md-list class="md-double-line">
        <md-subheader>Name</md-subheader>
        <md-list-item>
          <md-icon class="md-primary">person</md-icon>

          <div class="md-list-item-text">{{submission.patient01_name}}</div>
        </md-list-item>
      </md-list>

      <md-list class="md-double-line">
        <md-divider></md-divider>

        <md-subheader>Phone</md-subheader>

        <md-list-item>
          <md-icon class="md-primary">phone</md-icon>

          <div class="md-list-item-text">
            <span>{{submission.patient01_number}}</span>
            <span>Mobile</span>
          </div>
        </md-list-item>

        <md-divider></md-divider>

        <md-subheader>Email</md-subheader>

        <md-list-item>
          <md-icon class="md-primary">email</md-icon>

          <div class="md-list-item-text">
            <span>{{submission.email}}</span>
            <span>Personal</span>
          </div>
        </md-list-item>
        <md-divider></md-divider>

        <md-list-item>
          <md-button
            class="administer-btn"
            @click="showDialog = true"
            v-if="submission.checked === 'false'"
          >Administer Test</md-button>
        </md-list-item>
      </md-list>
    </div>

    <div class="viewport" :class="'md-layout-item md-size-55'">
      <md-toolbar :md-elevation="1">
        <span class="md-title">Household Info</span>
      </md-toolbar>

      <md-list>
        <md-subheader class>Household Size</md-subheader>
        <md-list-item>
          <div class="md-list-item-text">{{submission.househould_size}} Individual(s)</div>
        </md-list-item>

        <md-list-item>
          <md-table v-model="patients" table-header-color="green">
            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Name">{{ item.name }}</md-table-cell>
              <md-table-cell md-label="Date of Birth">{{item.dob}} ({{ calcAge(item.dob) }}y/o)</md-table-cell>
              <md-table-cell md-label="Sex">{{item.sex}}</md-table-cell>
              <md-table-cell md-label="SSN">{{item.ssn}}</md-table-cell>
              <md-table-cell md-label="Relationship">{{item.insurance_relationship}}</md-table-cell>
              <md-table-cell md-label="Policy Number">{{item.insurance_number}}</md-table-cell>
            </md-table-row>
          </md-table>
        </md-list-item>
      </md-list>
    </div>
    <div>
      <md-dialog :md-active.sync="showDialog">
        <md-dialog-title>Practitioner Info</md-dialog-title>
        <md-dialog-content>
          <div class="dialog-form">
            <md-field>
              <label>Practitioner's Name</label>
              <md-input v-model="practitioner.name" required></md-input>
            </md-field>
            <md-field>
              <label>Practitioner's Address</label>
              <md-input v-model="practitioner.address" required></md-input>
              <span class="md-error">There is an error</span>
            </md-field>
            <md-field>
              <label>Practitioner's Phone Number</label>
              <md-input v-model="practitioner.phone_number" required></md-input>
              <span class="md-error">There is an error</span>
            </md-field>
            <md-field>
              <label>Practitioner's NPI#</label>
              <md-input v-model="practitioner.npi" required></md-input>
              <span class="md-error">There is an error</span>
            </md-field>
            <md-field>
              <label>Diagnosis</label>
              <md-textarea v-model="practitioner.diagnosis" required></md-textarea>
            </md-field>
            <md-field>
              <label>Signature</label>
              <VueSignaturePad width="400px" height="150px" ref="signaturePad" />
            </md-field>
            <md-button @click="undoSignature">Undo Signature</md-button>
          </div>
        </md-dialog-content>

        <md-dialog-actions>
          <md-button class="md-primary" @click="showDialog = false">Close</md-button>
          <md-button class="md-primary" @click="savePDF(); (showDialog=false);">Send to Lab</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>
  </div>
</template>

<script>
import SidebarComponent from "@/pages/SidebarComponent.vue";
import { db } from "@/config/firebaseInit";
import router from "@/router";
import StatsCard from "@/components/Cards/StatsCard.vue";
import moment from "moment";
import Swal from "sweetalert2";
import VueSignaturePad from "vue-signature-pad";

import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  name: "SubheaderExample",
  components: {
    SidebarComponent,
    StatsCard,
    VueSignaturePad
  },

  data() {
    return {
      submission: null,
      patients: [],
      showDialog: false,
      practitioner: {
        name: "",
        address: "",
        phone_number: "",
        npi: "",
        diagnosis: ""
      }
    };
  },

  async created() {
    await db
      .collection("form_submissions")
      .doc(this.$route.params.id)
      .get()
      .then(result => {
        this.submission = result.data();
      });
    await this.getAllPatients();
  },

  methods: {
    validatePractitioner(doc) {
      let practitioner = this.practitioner;
      for (let field in practitioner) {
        if (!practitioner[field]) {
          Swal.fire(
            "Failure!",
            "Please make sure you filled all the fields above.",
            "error"
          );
          return false;
        }
      }
      doc.text("Practitioner's Info:", 14, 30);
      return doc.autoTable({
        head: [["Name", "Address", "Diagnosis", "NPI#", "Phone#"]],
        body: [
          [
            practitioner.name,
            practitioner.address,
            practitioner.diagnosis,
            practitioner.npi,
            practitioner.phone_number
          ]
        ],
        startY: 40
      });
    },
    validateSignature(doc) {
      const { data } = this.$refs.signaturePad.saveSignature();
      let width = doc.internal.pageSize.getWidth();
      let height = doc.internal.pageSize.getHeight();
      if (!data) {
        Swal.fire(
          "Failure!",
          "Please make sure to sign the signature field!",
          "error"
        );
        return false;
      }
      doc.text("Practitioner's Signature:", 14, 90);
      return doc.addImage(data, "jpeg", 14, 90, width / 3, height / 6);
    },
    validateTable(doc) {
      let practitioner = this.practitioner;
      let ele = document.querySelector("table");
      ele.setAttribute("id", "patients-table");
      doc.text("Patients' Info:", 14, 160);
      return doc.autoTable({
        html: "#patients-table",
        startY: 170,
        theme: "grid"
      });
    },
    validateQuestions(doc) {
      doc.setFontSize(13);
      doc.text("Experienced fever?:", 14, 270);
      doc.text("Difficulty breathing?:", 74, 270);
      doc.text("Sore throat?:", 134, 270);
      doc.text(
        "Have you been exposed to COVID-19 or believe you have?:",
        14,
        280
      );
      doc.setFontSize(12);

      if (this.submission.fever === "Yes") {
        doc.setTextColor("red");
        doc.text("Yes", 56, 270);
      } else if (this.submission.fever === "Unsure") {
        doc.setTextColor("blue");
        doc.text("Unsure", 56, 270);
      } else {
        doc.setTextColor("green");
        doc.text("No", 56, 270);
      }
      if (this.submission.difficulty_breathing === "Yes") {
        doc.setTextColor("red");
        doc.text("Yes", 117, 270);
      } else {
        doc.setTextColor("green");
        doc.text("No", 117, 270);
      }
      if (this.submission.sore_throat === "Yes") {
        doc.setTextColor("red");
        doc.text("Yes", 162, 270);
      } else {
        doc.setTextColor("green");
        doc.text("No", 162, 270);
      }
      if (this.submission.exposure === "Yes") {
        doc.setTextColor("red");
        doc.text("Yes", 137, 280);
      } else {
        doc.setTextColor("green");
        doc.text("Yes", 137, 280);
      }
    },
    savePDF() {
      const doc = new jsPDF("p", "mm", "a4");
      let practitioner = this.validatePractitioner(doc);
      let table = this.validateTable(doc);
      let signature = this.validateSignature(doc);
      let questions = this.validateQuestions(doc);
      // console.log(doc)
      var pdfBase64 = doc.output("datauristring");

      // doc.save("table2.pdf");
    },
    submit() {
      Swal.fire("Success!", "You sent the form to the lab!", "success");
    },
    undoSignature() {
      this.$refs.signaturePad.undoSignature();
    },
    getPatientInfo(submission, arr, n) {
      let patients = arr;
      if (!submission[`patient0${n}_name`]) {
        return null;
      }
      let patient = {
        name: null,
        number: null,
        sex: null,
        ssn: null,
        dob: null,
        insurance_company: null,
        insutance_number: null,
        insutance_name: null,
        insurance_relationship: null
      };
      patient.name = submission[`patient0${n}_name`];
      patient.number = submission[`patient0${n}_number`];
      patient.ssn = submission[`patient0${n}_ssn`];
      patient.dob = submission[`patient0${n}_dob`];
      patient.sex = submission[`patient0${n}_sex`];
      patient.insurance_company = submission[`patient0${n}_insurance_company`];
      patient.insurance_number = submission[`patient0${n}_insurance_number`];
      patient.insurance_name = submission[`patient0${n}_insurance_name`];
      patient.insurance_relationship =
        submission[`patient0${n}_insurance_relationship`];

      patients.push(patient);

      this.getPatientInfo(submission, patients, n + 1);

      return arr;
    },

    getAllPatients() {
      let patients = this.getPatientInfo(this.submission, [], 1);
      this.patients = patients;
      return this.patients;
    },
    calcAge(dob) {
      let newDob = dob.split("/").join("-");
      let age = moment().diff(newDob, "years", false);
      return age;
    }
  }
};
</script>

<style lang="scss" scoped>
.viewport {
  width: 320px;
  max-width: 100%;
  display: inline-block;
  vertical-align: top;
  overflow: auto;
  border: 1px solid rgba(#000, 0.12);
}

.flex-right {
  display: flex;
  flex-direction: column;
}
.administer-btn {
  width: 100%;
  display: flex;
  font-size: 17px;
  font-weight: bold;
}
.md-dialog {
  max-width: 768px;
  min-width: 500px;
  min-height: 600px;
  // padding: 40px;
}

.dialog-form {
  padding: 50px;
}
</style>
