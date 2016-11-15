<template lang="html">
  <div class="container">
    <h1>Register An Account</h1>
    <hr>
    <form v-on:submit.prevent="submit">
      <div v-show="error" class="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> {{ error }}
      </div>
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" class="form-control" v-model="body.username" id="username" placeholder="Username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" class="form-control" v-model="body.password" id="password" placeholder="******">
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
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
        username: '',
        password: ''
      }
    };
  },
  computed: {},
  methods: {
    submit() {
      var credentials = {
        username: this.body.username,
        password: this.body.password
      };
      auth.signup(this, credentials, 'users');
    }
  },
  components: {}
};
</script>

<style lang="css">
</style>
