<template lang="html">
  <div class="container">
    <h1>Note List</h1>
    <hr>
    <form v-on:submit.prevent="submit">
      <div v-show="error" class="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> {{ error }}
      </div>
      <div class="form-group">
        <input type="text" class="form-control" v-model="body.title" id="text" placeholder="Title">
      </div>
      <div class="form-group">
        <input type="text" class="form-control" v-model="body.text" id="text" placeholder="Text">
      </div>
      <button type="submit" class="btn btn-primary">Create Item</button>
    </form>
    <hr>
    <table class="table">
      <thead class="thead thead-inverse">
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Description</th>
          <th>Created By</th>
          <th>Creation Date</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody v-for="note in notes">
        <tr>
          <td>{{ note.id }}</td>
          <td><router-link :to="{ name: 'noteSingle', params: { id: note.id }}">{{ note.title }}</router-link></td>
          <td>{{ note.text }}</td>
          <td>{{ note.createdby }}</td>
          <td>{{ note.createdon }}</td>
          <td>
            <a v-on:click="remove(note.id)">
              <i class="fa fa-trash"></i>
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      error: null,
      notes: [],
      body: {
        title: '',
        text: '',
      }
    };
  },
  created () {
    this.$http.get('/api/notes').then(response => {
      this.notes = response.data;
    });
  },
  computed: {},
  methods: {
    remove (id) {
      this.$http.delete('/api/notes/' + id).then(response => {
        if (response.status == 200) {
           location.reload(true);
        }
      })
    },
    submit() {
      this.$http.post('/api/notes', {
        title: this.body.title,
        text: this.body.text,
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
