import Maybe from "true-myth/maybe";
import Form, { FromModel } from "@olo/principled-forms/form";
import Field from "@olo/principled-forms/field";

// -- That sufficiently sets up the example to demonstrate how performance
// degrades. To demonstrate the performance regression, simply
interface User {
  age: number;
  name?: string;
  email: Maybe<string>;
  spouse?: User;
}

const formFromUser: FromModel<User> = user => ({
  age: Field.required({ value: user.age }),
  name: Field.optional({ value: user.name }),
  email: Field.optional({
    value: user.email
      ? user.email.match({ Just: v => v, Nothing: () => undefined })
      : undefined
  }),
  spouse: Field.optional({ value: user.spouse })
});

let a: Form<User> = formFromUser({
  age: 31,
  name: "Chris",
  email: Maybe.just("hello@chriskrycho.com")
});
