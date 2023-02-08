db.createUser({
  user: "aesirxweb3",
  pwd: "demo",
  roles: [
    {
      role: "dbOwner",
      db: "aesirxweb3",
    },
  ],
});
