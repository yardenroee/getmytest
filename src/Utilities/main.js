import moment from "moment";

const mixin = function() {
  return {
    filters: {
      capitalize(sentence) {
        return sentence.replace(/\b\w/g, l => l.toUpperCase());
      },
      key_to_text(key) {
        return key.replace("_", " ");
      },
      format_date(timestamp) {
        return moment(timestamp).format("MM/DD/YYYY");
      },
      format_date_time(timestamp) {
        return moment(timestamp).format("MM/DD/YYYY hh:mm a");
      },
      format_time(timestamp) {
        return moment(timestamp).format("hh:mm a");
      },
      format_dow(timestamp) {
        return moment(timestamp).format("dddd");
      }
    },
    methods: {
      calcTimes() {
        let d = Date.now();
        return {
          createdAt: d,
          year: moment(d).format("Y"),
          month: moment(d).format("MMMM"),
          monthNum: moment(d).format("M"),
          day: moment(d).format("dddd"),
          dayNum: moment(d).format("d")
        };
      }
    },
  };
};

export default {
  mixin
};
