import Link from 'next/link';

const Index = () => (
  <div>
    <Link href={{ pathname: '/about', query: {name: 'abc' }}}>
      <a>About page</a>
    </Link>
    <Link href={{ pathname: '/about', query: {name: 'abc' }}}>
      <button>Go to about page</button>
    </Link>
    <p>Hello Next.js</p>
  </div>
)

export default Index