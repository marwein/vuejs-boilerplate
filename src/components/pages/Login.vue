<template lang="html">
  <div class="container">
    <h1>Login</h1>
    <hr>
    <form v-on:submit.prevent="submit">
      <div v-show="error" class="alert alert-danger" role="alert">
        <strong>Oh snap!</strong> {{ error }}
      </div>
      <div class="form-group">
        <label for="email">Username</label>
        <input type="text" class="form-control" v-model="body.username" id="email" placeholder="Username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" class="form-control" v-model="body.password" id="password" placeholder="******">
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
    </form>
  </div>
</template>

<script>
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
      this.$http.post('/api/auth/login', {
        username: this.body.username,
        password: this.body.password,
      })
      .then(function (response) {
        if (response.status == 200) {
          window.location.href = '/users';
        }
      })
      .catch(function (error) {
        this.error = error.data.error;
      });
    }
  },
  components: {}
};
</script>

<style lang="css">
</style>
