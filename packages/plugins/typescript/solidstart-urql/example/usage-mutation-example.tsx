// Example showing how to use mutations with the generated actions

import { useAction, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";
import { actionCreateUser } from "./generated/graphql";

export function AddUserForm() {
  // Call the generated action function inside the component
  const createUserAction = actionCreateUser();

  // Use the action with SolidStart's primitives
  const createUser = useAction(createUserAction);
  const submission = useSubmission(createUserAction);

  let nameRef: HTMLInputElement | undefined;
  let emailRef: HTMLInputElement | undefined;

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!nameRef?.value || !emailRef?.value) return;

    const result = await createUser({
      name: nameRef.value,
      email: emailRef.value,
    });

    if (result.data) {
      console.log("User created:", result.data.createUser);
      nameRef.value = "";
      emailRef.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={nameRef} type="text" placeholder="Name" required />
      <input ref={emailRef} type="email" placeholder="Email" required />
      <button type="submit" disabled={submission.pending}>
        {submission.pending ? "Creating..." : "Create User"}
      </button>
      <Show when={submission.result && submission.result.error}>
        <p style={{ color: "red" }}>Error: {submission.result.error.message}</p>
      </Show>
      <Show when={submission.result && submission.result.data}>
        <p style={{ color: "green" }}>
          User created: {submission.result.data.createUser.name}
        </p>
      </Show>
    </form>
  );
}
