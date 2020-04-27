<template>
  <div class="md-layout">
    <div class="md-layout-item md-size-100">
      <md-card>
        <md-card-header class="md-card-header-icon md-card-header-green">
          <div class="card-icon">
            <md-icon>assignment</md-icon>
          </div>
          <h4 class="title">Simple Table</h4>
        </md-card-header>
        <md-card-content>
          <md-table v-model="submissions" table-header-color="green">
            <md-table-row slot="md-table-row" slot-scope="{ item }"  @click="goTo(item)">
              <md-table-cell
                md-label="Transaction ID"
               >{{ JSON.parse(item.order_info).transactionid }}</md-table-cell>
              <md-table-cell md-label="Name">{{ item.patient01_name }}</md-table-cell>
              <md-table-cell md-label="Phone Number">
                {{
                item.patient01_number
                }}
              </md-table-cell>
              <md-table-cell md-label="Household Size">{{ item.househould_size }}</md-table-cell>
              <md-table-cell md-label="Insurance">{{ item.patient01_insurance_company }}</md-table-cell>
            </md-table-row>
          </md-table>
        </md-card-content>
      </md-card>
    </div>
  </div>
</template>

<script>
import { db } from "@/config/firebaseInit";
import SideBar from "@/components/SidebarPlugin/SideBar.vue";
import router from "@/router";

export default {
  data() {
    return {
      submissions: null,
    };
  },
  firestore() {
    return {
      submissions: db.collection("form_submissions")
    };
  },
  methods: {
    goTo(item) {
      let id = item.id
      this.$router.push(`/submissions/${id}`);
    }
  },
  components: {
    SideBar
  },
 async created() {
    let checked = this.$route.matched[1].props.checked;
   await db.collection("form_submissions")
      .get()
      .then(results => {
        results.forEach(doc => {
          if (checked === true) {
            this.submissions = this.submissions.filter(item => {
              return item.checked === "true";
            });
          } else {
            this.submissions = this.submissions.filter(item => {
              return item.checked === "false";
            });
          }
        });
      });
  }
};
</script>

<style>
</style>