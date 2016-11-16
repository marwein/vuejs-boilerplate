<template lang="html">
  <div class="container">
    <h1>Login</h1>
    <hr>
    <form v-on:submit.prevent="submit">
      <div v-show="error" class="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> {{ error }}
      </div>
      <div class="alert alert-warning" role="alert" v-show="errors.any()">
        <ul v-for="error in errors.all()">
          <li>{{error}}</li>
        </ul>
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input v-validate data-rules="required|email" type="text" class="form-control" v-model="body.email" name="email" id="email" placeholder="sample@email.com">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-validate data-rules="required" name="password" type="password" class="form-control" v-model="body.password" id="password" placeholder="******">
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script>
import auth from '../../auth'

export default {
  data () {
    return {
      error: null,
      body: {
        email: '',
        password: ''
      }
    };
  },
  computed: {},
  methods: {
    submit() {
      var credentials = {
        email: this.body.email,
        password: this.body.password
      };
      auth.login(this, credentials, 'todo');
    }
  },
  components: {}
};
</script>

<style lang="css">
</style>
