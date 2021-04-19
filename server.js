import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull, GraphQLInt, GraphQLList } from 'graphql';
import { authors, books } from './staticdata.js';
const app = express();

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'represents a book written by some author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id == book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'represents an author who has written some books',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => author.id == book.authorId)
            }
        }
    })
})


const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'singular book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return books.find(book => book.id == args.id)
            }
        },
        books: {
            type: GraphQLList(BookType),
            description: 'list of all books',
            resolve: () => books
        },
        author: {
            type: AuthorType,
            description: 'single author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => {
                return authors.find(author => author.id == args.id)
            }
        },
        authors: {
            type: GraphQLList(AuthorType),
            description: 'list of all authors',
            resolve: () => authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add book',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = {id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add author',
            args: {
                name: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {id: authors.length + 1, name: args.name }
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(5000, () => console.log('Server running on 5000.'));