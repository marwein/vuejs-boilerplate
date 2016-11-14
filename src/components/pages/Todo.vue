<template lang="html">
  <div class="container">
    <h1>Todo List</h1>
    <hr>
    <form v-on:submit.prevent="submit">
      <div v-show="error" class="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> {{ error }}
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
          <th>Text</th>
          <th>Remove</th>
        </tr>
      </thead>
      <tbody v-for="todo in todos">
        <tr>
          <td>{{ todo.id }}</td>
          <td><router-link :to="{ name: 'todoItem', params: { id: todo.id }}">{{ todo.text }}</router-link></td>
          <td>
            <a v-on:click="remove(todo.id)">
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
      todos: [],
      body: {
        text: '',
      }
    };
  },
  created () {
    this.$http.get('/api/todos').then(response => {
      this.todos = response.data;
    });
  },
  computed: {},
  methods: {
    remove (id) {
      this.$http.delete('/api/todos/' + id).then(response => {
        if (response.status == 200) {
           location.reload(true);
        }
      })
    },
    submit() {
      this.$http.post('/api/todos', {
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
