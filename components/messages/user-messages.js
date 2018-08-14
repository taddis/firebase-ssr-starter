import React from 'react';
import { connect } from 'unistore/react';
import { actions } from '../../datastore';
import Paper from '../paper/paper';

import AddUserMessage from '../../database/messages/add-user-message';
import extractUserDisplayName from '../../utilities/user/extract-user-display-name';
import extractUserPhotoUrl from '../../utilities/user/extract-user-photo-url';

import UserMessagesSubscription from '../subscriptions/user-messages-subscription';
import MessagesTable from './messages-table';
import MessageForm from './message-form';

import './messages.css';
import extractUserEmail from '../../utilities/user/extract-user-email';

export class UserMessages extends React.Component {
  constructor() {
    super();

    const noop = async args => console.info(args);

    this.state = {
      finished: false,
      next: noop,
      scrollTargetIndex: 0,
      userMessages: [],
    };
  }

  get debounceMillis() {
    return 1000 * 0;
  }

  async sendMessage(text) {
    const { environment, user } = this.props;
    const uid = user.__id;
    const addUserMessage = AddUserMessage({ environment, uid });
    const message = {
      created: Date.now(),
      displayName: extractUserDisplayName(user),
      email: extractUserEmail(user),
      photoUrl: extractUserPhotoUrl(user),
      text,
      uid,
    };

    return addUserMessage(message);
  }

  handleUserMessages(userMessages) {
    this.debounce(() => {
      const first = userMessages[0];
      const last = userMessages[userMessages.length - 1];
      const isNewPage = !!last && first.__page < last.__page;
      const scrollTargetIndex = isNewPage ? getLastIndexByPage(userMessages, last.__page - 1) : 0;

      this.setState({ scrollTargetIndex });
      this.setState({ userMessages });
    });
  }

  debounce(fn) {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => fn(), this.debounceMillis);
  }

  render() {
    const { environment, user } = this.props;

    return (
      <>
        <UserMessagesSubscription
          environment={environment}
          userId={user.__id}
          onFinished={() => this.setState({ finished: true })}
          onSubscribed={({ next }) => this.setState({ next })}
          setUserMessages={this.handleUserMessages.bind(this)}
        />
        <div className="user-messages">
          <Paper>
            <h1>Messages</h1>

            <hr />

            <div className="wrapper">
              <MessagesTable
                finished={this.state.finished}
                next={this.state.next}
                messages={this.state.userMessages}
                scrollTargetIndex={this.state.scrollTargetIndex}
              />

              <MessageForm user={user} onMessage={this.sendMessage.bind(this)} />
            </div>
          </Paper>
        </div>
      </>
    );
  }
}

export default connect(
  'environment,user',
  actions
)(UserMessages);

function getLastIndexByPage(items, page) {
  return items.map(item => item.__page).lastIndexOf(page);
}
