// Your code here
import HttpServer from './server'

type Post = {
  postId: string
  title: string
  author: string
  text: string
}

const server = new HttpServer(3000)

const mockPostDB: Post[] = []

server.get('/', (req, res) => {
  res.status(200).send('Home page')
})

server.post('/api/posts/', (req, res) => {
  const post = req.payload
  if (post) {
    const postObj: Post = Object.assign({}, post, {
      // Should be random in future. MongoDB does it automatically for each entry.
      postId: (mockPostDB.length + 1).toString(),
    })

    if (isPost(postObj)) {
      mockPostDB.push(postObj)
      return res
        .status(200)
        .send(JSON.stringify('Successfully added book to database.'))
    }
  }
  return res.status(400).send(JSON.stringify('Error: Bad Request'))
})

server.delete('/api/posts/:postId', (req, res) => {
  const postId = req.params?.postId
  if (postId) {
    const indexOfItem = mockPostDB.findIndex((item) => item.postId === postId)
    if (indexOfItem !== -1) {
      mockPostDB.splice(indexOfItem, 1)
      return res.status(200).send('Item deleted')
    }
  }
  return res.status(404).send('Resource not found')
})

server.put('/api/posts/:postId', (req, res) => {
  console.log(mockPostDB)
  const postId = req.params?.postId
  const updatedPost: Partial<Post> = req.payload
  if (postId) {
    let item = mockPostDB.find((item) => item.postId === postId)
    if (item) {
      item = Object.assign(item, {
        ...updatedPost,
      })
      res.status(200).send(`Updated ${postId}`)
    }
  }
  return res.status(404).send('Resource not found')
})

server.listen()

const isPost = (postObj: Post): postObj is Post => {
  return (
    typeof postObj.postId === 'string' &&
    typeof postObj.title === 'string' &&
    typeof postObj.author === 'string' &&
    typeof postObj.text === 'string'
  )
}
