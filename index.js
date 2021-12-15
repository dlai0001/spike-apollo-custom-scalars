const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');


// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
  scalar ObjectID

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    id: ID!
    title: String
    author: String
    objectId: ObjectID
  }

  type UpdateBookReturn {
    book: Book
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    book(id: ID!): Book    
  }

  type Mutation {
    updateBook(id: ID!, title: String!): UpdateBookReturn
    updateBookObjId(id: ID!, objectId: ObjectID!): UpdateBookReturn
  }
`;

const books = [
  {
    id: '1',
    title: 'The Awakening',
    author: 'Kate Chopin',
    objectId: '1233',
  },
  {
    id: '2',
    title: 'City of Glass',
    author: 'Paul Auster',
    objectId: '1234',
  },
];

const findBook = async (id) => {
  console.log('findBook: called')
  return books.find(x => x.id === id)
}

// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const Book = {  
  title: async (parent) => {    
    console.log('UpdateBookReturn: title resolver called')
    if(parent.title) {
      return parent.title
    }
    parent.rootValue = parent.rootValue || findBook(parent.id)    

    return (await parent.rootValue).title
  },

  author: async (parent) =>  {
    console.log('UpdateBookReturn: author resolver called')
    if(parent.aurthor) {
      return parent.aurthor
    }
    parent.rootValue = parent.rootValue || findBook(parent.id)    

    return (await parent.rootValue).author
  },
  objectId: async (parent) => {
    parent.rootValue = parent.rootValue || findBook(parent.id)
    return (await parent.rootValue).objectId
  }
}

// A Custom scalar
const ObjectIDScalar = new GraphQLScalarType({
  name: 'ObjectID',
  description: 'ObjectID custom scalar type',
  serialize(value) {
    return `'obj:${value}'`
  },
  parseValue(value) {
    return value.split(':')[1]
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ast.value.split(':')[1]      
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});

const resolvers = {
  Query: {
    books: () => books,
    book: (_, {id}) => books.find(x => x.id === id)
  },
  Mutation: {
    updateBook: (p, {id, title}) => {
      console.log("updateBook: called")
      const book = books.find(x => x.id === id)
      book.title = title

      return {
        book: {
          id: book.id,
          title: title,
        }
      }
    },
    updateBookObjId: (p, {id, objectId}) => {
      console.log("updateBookObjId: called")
      const book = books.find(x => x.id === id)
      book.objectId = objectId

      return {
        book: {
          id: book.id,
          objectId: objectId,
        }
      }
    }
  },  
  Book: Book,
  ObjectID: ObjectIDScalar,
};


  // The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});