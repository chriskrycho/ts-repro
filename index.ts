import Maybe from "true-myth/maybe";
import Form, { FromModel } from "@olo/principled-forms/form";
import Field from "@olo/principled-forms/field";

interface User {
  age: number;
  name?: string;
  // This is fine.
  email?: string;
  // This is very ***NOT FINE***.
  // email: Maybe<string>;
}

const formFromUser: FromModel<User> = user => ({
  age: Field.required({ value: user.age }),
  name: Field.optional({ value: user.name }),
  email: Field.optional({ value: user.email })
});

let a: Form<User> = formFromUser({
  age: 31,
  name: "Chris"
});
