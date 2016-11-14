<template lang="html">
  <div class="container">
    <br>
    <form v-on:submit.prevent="edit">
      <div v-show="error" class="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> {{ error }}
      </div>
      <h3>ID: <small>{{todo.id}}</small></h3>
      <div class="form-group">
        <input type="text" class="form-control" v-model="todo.text" id="text">
      </div>
      <button type="submit" class="btn btn-primary">Edit Item</button>
    </form>
    <hr>
    <a v-on:click="remove(todo.id)">
      <i class="fa fa-trash">Remove Item</i>
    </a>
    <hr>
  </div>
</template>

<script>
export default {
  data () {
    return {
      error: null,
      todo: [],
    };
  },
  created () {
    this.$http.get('/api/todos/' + this.$route.params.id).then(response => {
      this.todo = response.data[0];
    });
  },
  computed: {},
  methods: {
    remove (id) {
      this.$http.delete('/api/todos/' + id).then(response => {
        if (response.status == 200) {
          window.location.href = '/todo';
        }
      })
    },
    edit() {
      this.$http.put('/api/todos/' + this.todo.id, {
        text: this.todo.text,
      })
      .then(function (response) {
        if (response.status == 200) {
           location.reload(true);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }
  },
  components: {}
};
</script>

<style lang="css">
</style>
