import { MessageType, NotificationMessage } from '../types/MessageCenter';
import { MessageCenterState } from '../store/Store';
import { KialiAppAction } from '../actions/KialiAppAction';
import { getType } from 'typesafe-actions';
import { MessageCenterActions } from '../actions/MessageCenterActions';
import { updateState } from '../utils/Reducer';
import { findIndex, findLastIndex } from 'lodash';
import { LoginActions } from '../actions/LoginActions';

export const INITIAL_MESSAGE_CENTER_STATE: MessageCenterState = {
  nextId: 0,
  groups: [
    {
      id: 'systemErrors',
      title: 'Open issues',
      messages: [],
      showActions: false,
      hideIfEmpty: true
    },
    {
      id: 'default',
      title: 'Notifications',
      messages: [],
      showActions: true,
      hideIfEmpty: false
    }
  ],
  hidden: true,
  expanded: false,
  expandedGroupId: 'default'
};

const createMessage = (id: number, content: string, type: MessageType, count = 0) => {
  return {
    id,
    content,
    type,
    count,
    show_notification: type === MessageType.ERROR || type === MessageType.WARNING,
    seen: false,
    created: new Date()
  };
};

// Updates several messages with the same payload, useful for marking messages
// returns the updated state
const updateMessage = (state: MessageCenterState, messageIds: number[], updater) => {
  const groups = state.groups.map(group => {
    group = {
      ...group,
      messages: group.messages.map(message => {
        if (messageIds.includes(message.id)) {
          message = updater(message);
        }
        return message;
      })
    };
    return group;
  });
  return updateState(state, { groups });
};

const filterOutInBetweenMessages = (searchString: string, messages: NotificationMessage[]): NotificationMessage[] => {
  const firstMessageIndex = findIndex(messages, message => {
    return message.content === searchString;
  });
  const lastMessageIndex = findLastIndex(messages, message => {
    return message.content === searchString;
  });

  const idsToBeRemoved = messages
    .filter((message, index) => {
      const indexWithinRange = index > firstMessageIndex && index < lastMessageIndex;
      const contentMatches = message.content === searchString;

      return indexWithinRange && contentMatches;
    })
    .map(message => {
      return message.id;
    });

  // now return everything that doesn't match the ids that should be removed
  const finalFilteredResults = messages.filter(message => {
    return !idsToBeRemoved.includes(message.id);
  });

  return finalFilteredResults;
};

const findLastMessageAndIncrementCount = (
  searchString: string,
  messages: NotificationMessage[]
): NotificationMessage[] => {
  const lastMessageIndex = findLastIndex(messages, message => {
    return message.content === searchString;
  });
  const lastMatchingMessage = messages[lastMessageIndex];
  if (lastMatchingMessage) {
    lastMatchingMessage.count = lastMatchingMessage.count + 1;
  }
  console.dir(lastMatchingMessage);
  // const newMessages = messages.map(message: NotificationMessage => {
  //
  //   return message;
  // };
  return messages;
};

const Messages = (
  state: MessageCenterState = INITIAL_MESSAGE_CENTER_STATE,
  action: KialiAppAction
): MessageCenterState => {
  switch (action.type) {
    case getType(MessageCenterActions.addMessage): {
      const { groupId, content, messageType } = action.payload;

      console.dir(state);

      const groups = state.groups.map(group => {
        if (group.id === groupId) {
          group = { ...group, messages: group.messages.concat([createMessage(state.nextId, content, messageType)]) };
          const newMessage = createMessage(state.nextId, content, messageType);
          const newMessages = group.messages.concat(newMessage);
          const filteredMessages = filterOutInBetweenMessages(content, newMessages);
          const updatedCountMessages = findLastMessageAndIncrementCount(content, filteredMessages);
          console.dir(updatedCountMessages);
          group = Object.assign({}, group, {
            messages: updatedCountMessages
          });
          return group;
        }
        return group;
      });
      return updateState(state, { groups: groups, nextId: state.nextId + 1 });
    }

    case getType(MessageCenterActions.removeMessage): {
      const messageId = action.payload.messageId;
      const groups = state.groups.map(group => {
        group = {
          ...group,
          messages: group.messages.filter(message => {
            return !messageId.includes(message.id);
          })
        };
        return group;
      });
      return updateState(state, { groups });
    }

    case getType(MessageCenterActions.markAsRead): {
      return updateMessage(state, action.payload.messageId, message => ({
        ...message,
        seen: true,
        show_notification: false
      }));
    }

    case getType(MessageCenterActions.hideNotification): {
      return updateMessage(state, action.payload.messageId, message => ({ ...message, show_notification: false }));
    }

    case getType(MessageCenterActions.showMessageCenter):
      if (state.hidden) {
        return updateState(state, { hidden: false });
      }
      return state;

    case getType(MessageCenterActions.hideMessageCenter):
      if (!state.hidden) {
        return updateState(state, { hidden: true });
      }
      return state;

    case getType(MessageCenterActions.toggleExpandedMessageCenter):
      return updateState(state, { expanded: !state.expanded });

    case getType(MessageCenterActions.toggleGroup): {
      const { groupId } = action.payload;
      if (state.expandedGroupId === groupId) {
        return updateState(state, { expandedGroupId: undefined });
      }
      return updateState(state, { expandedGroupId: groupId });
    }

    case getType(MessageCenterActions.expandGroup): {
      const { groupId } = action.payload;
      return updateState(state, { expandedGroupId: groupId });
    }
    case getType(LoginActions.loginRequest): {
      // Let's clear the message center quen user is loggin-in. This ensures
      // that messages from a past session won't persist because may be obsolete.
      return INITIAL_MESSAGE_CENTER_STATE;
    }
    default:
      return state;
  }
};

export default Messages;
