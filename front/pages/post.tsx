import * as React from 'react';
import Link from 'next/link';
const fetch = require('isomorphic-unfetch');

import AppLayout from '../components/AppLayout'
import Show from '../models/Show';
import InitialProps from '../models/InitialProps';

export interface PostProps {
  show: Show;
}

class Post extends React.Component<PostProps, any> {
  static async getInitialProps(context:InitialProps) {
    const { id } = context.query;
    const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
    const show = await res.json();
  
    console.log(`Fetched show: ${show.name}`)
  
    return { show };
  }

  render() {
    return (
      <AppLayout>
        <h1>{ this.props.show.name }</h1>
        <p>{ this.props.show.summary.replace(/<[/]?p>/g, '') }</p>
        <img src={ this.props.show.image.medium } alt="Medium image"/>
      </AppLayout>
    );
  }
}

export default Post;