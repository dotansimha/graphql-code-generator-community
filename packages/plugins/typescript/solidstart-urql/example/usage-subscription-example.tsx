import { For, Show, createSignal } from 'solid-js';
import {
  useSubscriptionOnUserAdded,
  useSubscriptionOnPostAdded,
  useSubscriptionOnUserUpdated,
  type OnUserAddedSubscription,
  type OnPostAddedSubscription,
} from './generated/graphql';

// Example 1: Subscription without variables
export function UserAddedSubscription() {
  const [users, setUsers] = createSignal<OnUserAddedSubscription['userAdded'][]>([]);

  const [state] = useSubscriptionOnUserAdded({
    variables: {},
  }, (prev, response) => {
    // Handler to accumulate users as they're added
    setUsers(current => [...current, response.userAdded]);
    return response;
  });

  return (
    <div>
      <h2>New Users (Live)</h2>
      <Show when={state.error}>
        <p style={{ color: 'red' }}>Error: {state.error.message}</p>
      </Show>
      <ul>
        <For each={users()}>
          {user => (
            <li>
              {user.name} ({user.email})
            </li>
          )}
        </For>
      </ul>
      <Show when={users().length === 0}>
        <p>No new users yet...</p>
      </Show>
    </div>
  );
}

// Example 2: Subscription without variables, simpler approach
export function PostAddedSubscription() {
  const [posts, setPosts] = createSignal<OnPostAddedSubscription['postAdded'][]>([]);

  const [state] = useSubscriptionOnPostAdded({}, (prev, response) => {
    setPosts(current => [...current, response.postAdded]);
    return response;
  });

  return (
    <div>
      <h2>New Posts (Live)</h2>
      <Show when={state.error}>
        <p style={{ color: 'red' }}>Error: {state.error.message}</p>
      </Show>
      <div>
        <For each={posts()}>
          {post => (
            <article style={{ 'margin-bottom': '20px', 'border-bottom': '1px solid #ccc' }}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small>By: {post.author.name}</small>
            </article>
          )}
        </For>
      </div>
    </div>
  );
}

// Example 3: Subscription with variables
export function UserUpdatedSubscription(props: { userId: string }) {
  const [state] = useSubscriptionOnUserUpdated({
    variables: { userId: props.userId },
  });

  return (
    <div>
      <h2>User Updates for ID: {props.userId}</h2>
      <Show when={state.error}>
        <p style={{ color: 'red' }}>Error: {state.error.message}</p>
      </Show>
      <Show when={state.data}>
        <div>
          <h3>{state.data!.userUpdated.name}</h3>
          <p>Email: {state.data!.userUpdated.email}</p>
          <h4>Posts:</h4>
          <ul>
            <For each={state.data!.userUpdated.posts}>
              {post => <li>{post.title}</li>}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  );
}

// Example 4: Pausing/resuming a subscription
export function PausableSubscription() {
  const [paused, setPaused] = createSignal(false);
  const [users, setUsers] = createSignal<OnUserAddedSubscription['userAdded'][]>([]);

  const [state] = useSubscriptionOnUserAdded({
    variables: {},
    pause: paused,
  }, (prev, response) => {
    setUsers(current => [...current, response.userAdded]);
    return response;
  });

  return (
    <div>
      <h2>Pausable User Subscription</h2>
      <button onClick={() => setPaused(!paused())}>
        {paused() ? 'Resume' : 'Pause'} Subscription
      </button>
      <Show when={state.error}>
        <p style={{ color: 'red' }}>Error: {state.error.message}</p>
      </Show>
      <p>Status: {paused() ? 'Paused' : 'Active'}</p>
      <ul>
        <For each={users()}>
          {user => <li>{user.name}</li>}
        </For>
      </ul>
    </div>
  );
}

// Example 5: Combined example - all subscription features
export function CompleteSubscriptionExample() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>GraphQL Subscriptions Examples</h1>

      <section style={{ 'margin-bottom': '40px' }}>
        <UserAddedSubscription />
      </section>

      <section style={{ 'margin-bottom': '40px' }}>
        <PostAddedSubscription />
      </section>

      <section style={{ 'margin-bottom': '40px' }}>
        <UserUpdatedSubscription userId="123" />
      </section>

      <section style={{ 'margin-bottom': '40px' }}>
        <PausableSubscription />
      </section>
    </div>
  );
}
