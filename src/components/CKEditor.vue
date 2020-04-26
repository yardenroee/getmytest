<template>
  <div class="ckeditor">
    <label>{{label}}</label>
    <ckeditor  :editor="editor" v-model="dataToEmit" :config="editorConfig" @keyup="updateData"></ckeditor>
  </div>
</template>

<script>
import CKEditor from '@ckeditor/ckeditor5-vue';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
export default {
  name: 'CKEditor',
  components: {
    ckeditor: CKEditor.component,
  },
  props: ['label', 'inputData'],
  data() {
    return {
      editor: ClassicEditor,
      dataToEmit: null,
      editorConfig: {},
    };
  },
  created(){
   this.dataToEmit = this.inputData;
  },
  watch: {
    dataToEmit() {
      this.updateData();
    },
    inputData() {
      this.dataToEmit = this.inputData;
    },
  },
  methods: {
    updateData() {
      this.$emit('updateData', this.dataToEmit);
    },
  },
};
</script>

<style>
.ckeditor {
  width: 600px;
}
</style>
