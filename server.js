import express, { response } from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'

const app = express()
app.use(cors())
app.use(express.json())

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'benserverplex.ddns.net',
  user: process.env.DB_USER || 'alunos',
  password: process.env.DB_PASSWORD || 'senhaAlunos',
  database: process.env.DB_DATABASE || 'web_03mb',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

app.post('/products', async (req, res) => {
  try {
    const { name, price, description = '', category } = req.body
    if (!name || price == null || category == null) {
      return res.status(400).json({ message: 'Dados incompletos' })
    }
    const priceNum = Number(price)
    if (Number.isNaN(priceNum)) return res.status(400).json({ message: 'Preço inválido' })
    const sql = 'INSERT INTO produtosEmilly (name,price,description,category) VALUES (?,?,?,?)'
    const params = [name, priceNum, description, category]
    await pool.execute(sql, params)
    return res.json({ message: 'Produto salvo com sucesso' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro ao salvar produto', error: err.message })
  }
})

app.get('/products', async (req, res) => {
  try {
    const sql = 'SELECT id, name, price, description, category FROM produtosEmilly'
    const [rows] = await pool.query(sql)
    return res.json(rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro ao obter produtos', error: err.message })
  }
})

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sql = 'DELETE FROM produtosEmilly WHERE id = ?'
    const [result] = await pool.execute(sql, [id])
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' })
    }
    
    return res.json({ message: 'Produto deletado com sucesso' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Erro ao deletar produto', error: err.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
