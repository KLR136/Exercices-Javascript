const express = require('express');
const router = express.Router();
const sql = require('./sql'); 


// Route pour récupérer toutes les tâches
router.get('/', async (req, res) => {
    try {
        const { 
            title, 
            done, 
            late, 
            page = 1, 
            limit = 10,
            sortBy = 'datetime',
            sortOrder = 'DESC'
        } = req.query;
        
        const connection = await sql.getConnection();
        
        // Construction de la requête de base
        let query = 'SELECT * FROM task WHERE 1=1';
        const params = [];
        
        // Filtres
        if (title) {
            query += ' AND title LIKE ?';
            params.push(`%${title}%`);
        }
        
        if (done !== undefined) {
            query += ' AND done = ?';
            params.push(done === 'true' ? 1 : 0);
        }
        
        if (late === 'true') {
            query += ' AND done = 0 AND datetime < NOW()';
        }
        
        // Comptage total pour la pagination
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
        const [countResult] = await connection.query(countQuery, params);
        const total = countResult[0].total;
        
        // Ajout du tri et pagination
        const validSortColumns = ['id', 'title', 'done', 'datetime'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'datetime';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY ${sortColumn} ${order}`;
        query += ' LIMIT ? OFFSET ?';
        
        const offset = (page - 1) * limit;
        params.push(parseInt(limit), parseInt(offset));
        
        const [results] = await connection.query(query, params);
        await connection.end();
        
        // Transformation des données
        const tasks = results.map(task => ({
            ...task,
            done: Boolean(task.done),
            isLate: !task.done && new Date(task.datetime) < new Date()
        }));
        
        res.json({
            tasks: tasks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / limit)
            },
            filters: {
                title: title || null,
                done: done || null,
                late: late || null,
                sortBy: sortColumn,
                sortOrder: order
            }
        });
        
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour une tâche spécifique
router.get('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const connection = await sql.getConnection();
        const [results] = await connection.query('SELECT id, title FROM task WHERE id = ?', [taskId]);
        await connection.end();
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        
        res.json(results[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


// Créer une nouvelle tâche
router.post('/', async (req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Le titre est requis' });
        }
        
        const connection = await sql.getConnection();
        const [result] = await connection.query(
            'INSERT INTO task (title, done, description, datetime) VALUES (?, ?, ?, ?)', 
            [title, 0, '', new Date()] 
        );
        await connection.end();
        
        res.status(201).json({ 
            id: result.insertId, 
            title: title 
        });
        
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


// Mettre à jour une tâche
router.patch('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, done, description } = req.body;
        
        if (!title && done === undefined && !description) {
            return res.status(400).json({ 
                error: 'Au moins un champ à mettre à jour est requis (title, done ou description)' 
            });
        }
        
        const connection = await sql.getConnection();
        
        let query = 'UPDATE task SET ';
        const params = [];
        const updates = [];
        
        if (title) {
            updates.push('title = ?');
            params.push(title);
        }
        
        if (done !== undefined) {
            updates.push('done = ?');
            params.push(done ? 1 : 0);
        }
        
        if (description !== undefined) {
            updates.push('description = ?');
            params.push(description);
        }
        
        query += updates.join(', ') + ' WHERE id = ?';
        params.push(taskId);
        
        const [result] = await connection.query(query, params);
        await connection.end();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        
        const connection2 = await sql.getConnection();
        const [task] = await connection2.query('SELECT * FROM task WHERE id = ?', [taskId]);
        await connection2.end();
        
        const updatedTask = task[0];
        
        res.json({ 
            id: parseInt(taskId),
            title: updatedTask.title,
            done: Boolean(updatedTask.done), 
            description: updatedTask.description,
            datetime: updatedTask.datetime,
            message: 'Tâche mise à jour avec succès' 
        });
        
    } catch (error) {
        console.error('Erreur détaillée PATCH:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Supprimer une tâche
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const connection = await sql.getConnection();
        const [result] = await connection.query('DELETE FROM task WHERE id = ?', [taskId]);
        await connection.end();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tâche non trouvée' });
        }
        
        res.json({ message: `Tâche avec l'ID ${taskId} supprimée` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;