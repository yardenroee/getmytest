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
            <md-table-row slot="md-table-row" slot-scope="{ item }"  >
              <md-table-cell
                md-label="Name"
               >{{ item.name }}</md-table-cell>
              <md-table-cell md-label="DOB">{{item.dob}} ({{ calcAge(item.dob) }}y/o) </md-table-cell>
              <md-table-cell md-label="Sex">
                {{item.sex}}
              </md-table-cell>
                            <md-table-cell md-label="ssn">
                {{item.ssn}}
              </md-table-cell>
            </md-table-row>
          </md-table>
        </md-list-item>
        
      </md-list>
    </div>
  </div>
</template>

<script>
import SidebarComponent from "@/pages/SidebarComponent.vue";
import { db } from "@/config/firebaseInit";
import router from "@/router";
import StatsCard from "@/components/Cards/StatsCard.vue";
import moment from 'moment';
export default {
  name: "SubheaderExample",
  components: {
    SidebarComponent,
    StatsCard
  },

  data() {
    return {
      submission: null,
      patients: []
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
      patient.insutance_number = submission[`patient0${n}_insutance_numbe`];
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
      console.log(this.patients)
      return this.patients;
    },
    calcAge(dob) {
      let newDob = dob.split("/").join("-")
      let age = moment().diff(newDob,'years',false)
      return age
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
</style>
