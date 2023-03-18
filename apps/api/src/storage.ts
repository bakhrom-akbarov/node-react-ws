// I want to move all the logic to storage.ts, so that index.ts will be only responsible for handling the connection and sending messages to the client.
// I decided to have a simple storage, which is just an object, in order not to spend time on setting up a database.
// Of course, in a real project, I would use a database, but for the sake of simplicity, I'm using an object.

type StorageType = {
  users: {
    [key: string]: {
      name: string;
      subscribers: string[];
      connectionId?: string;
    }
  }
}

const storage: StorageType = {
  users: {
    'user1': {
      name: 'User 1',
      subscribers: [],
      connectionId: 'a4106fbc-c3f8-11ed-afa1-0242ac120002',
    },
    'user2': {
      name: 'User 2',
      subscribers: [],
      connectionId: 'a41072c8-c3f8-11ed-afa1-0242ac120002',
    },
    'user3': {
      name: 'User 3',
      subscribers: [],
      connectionId: 'a4107426-c3f8-11ed-afa1-0242ac120002',
    },
  },
};

const countSubscribers = (userId: string): number => {
  const user = storage.users[userId];
  return user.subscribers.length;
}

const checkIfUserExists = (userId: string): boolean => {
  return !!storage.users[userId];
}

const checkIfUserIsSubscribed = (userId: string, subscriberId: string): boolean => {
  const user = storage.users[userId];
  return user.subscribers.includes(subscriberId);
}

const checkIfNotSubscribingToSelf = (userId: string, subscriberId: string): boolean => {
  return userId !== subscriberId;
}

const subscribe = (userId: string, subscriberId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!checkIfUserExists(userId)) {
      reject('User does not exist');
    }
    if (!checkIfNotSubscribingToSelf(userId, subscriberId)) {
      reject('You cannot subscribe to yourself');
    }
    if (checkIfUserIsSubscribed(userId, subscriberId)) {
      // Idempotency
      resolve('Subscribed');
    }
    const user = storage.users[subscriberId];
    if (!user.subscribers.includes(userId)) {
      user.subscribers.push(userId);
    }
    resolve('Subscribed');
  })
}

const unSubscribe = (userId: string, subscriberId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!checkIfUserExists(userId)) {
      reject('User does not exist');
    }
    if (!checkIfUserIsSubscribed(userId, subscriberId)) {
      // Idempotency
      resolve('Unsubscribed');
    }
    const user = storage.users[subscriberId];
    if (user.subscribers.includes(userId)) {
      const index = user.subscribers.indexOf(userId);
      user.subscribers.splice(index, 1);
    }
    resolve('Unsubscribed');
  })
}

export {
  countSubscribers,
  checkIfUserExists,
  checkIfUserIsSubscribed,
  subscribe,
  unSubscribe,
  storage
}
