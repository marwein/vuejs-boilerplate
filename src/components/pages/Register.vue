<template lang="html">
  <div class="container">
    <h1>Register An Account</h1>
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
        <label for="firstName">First Name</label>
        <input v-validate data-rules="required" type="text" class="form-control" v-model="body.firstName" name="firstName" id="firstName" placeholder="John">
      </div>
      <div class="form-group">
        <label for="lastName">Last Name</label>
        <input v-validate data-rules="required" type="text" class="form-control" v-model="body.lastName" name="lastName" id="lastName" placeholder="Doe">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input v-validate data-rules="required" name="password" type="password" class="form-control" v-model="body.password" id="password" placeholder="******">
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
        email: '',
        firstName: '',
        lastName: '',
        password: ''
      }
    };
  },
  computed: {},
  methods: {
    submit() {
      var credentials = {
        email: this.body.email,
        firstName: this.body.firstName,
        lastName: this.body.lastName,
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
