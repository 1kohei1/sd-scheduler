import Link from 'next/link';
import fetch from 'isomorphic-unfetch';

import MyLayout from '../components/MyLayout'

const Post = (props) => (
  <MyLayout>
    <h1>{ props.show.name }</h1>
    <p>{ props.show.summary.replace(/<[/]?p>/g, '') }</p>
    <img src={ props.show.image.medium } alt="Medium image"/>
  </MyLayout>
)

Post.getInitialProps = async function(context) {
  const { id } = context.query;
  const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
  const show = await res.json();

  console.log(`Fetched show: ${show.name}`)

  return { show };
}

export default Post;