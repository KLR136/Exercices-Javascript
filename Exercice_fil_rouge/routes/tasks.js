const express = require('express');
const router = express.Router();
const sql = require('./sql'); 

const filters = [{name: 'title', getQuery: value => `title LIKE '%${value}%'`}, 
{name: 'done', getQuery: value => `done = ${value === 'true' ? 1 : 0}`},
{name: 'late', getQuery: value => `done = 0 AND datetime < NOW()`}];

router.get('/', async (req, res) => {
    try {
        const { 
            title, 
            done, 
            late, 
            page = 1, 
            limit = 10,
            sortBy = 'id',
            sortOrder = 'ASC'
        } = req.query;
        
        const connection = await sql.getConnection();
        
        let query = 'SELECT * FROM task WHERE 1=1';
        const params = [];
        
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

        let parsedLimit = parseInt(limit);
        if (parsedLimit > 100) {
            parsedLimit = 100;
        }
        if (parsedLimit < 1) {
            parsedLimit = 1;
        }
        
        const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered`;
        const [countResult] = await connection.query(countQuery, params);
        const total = countResult[0].total;
        
        const validSortColumns = ['id', 'title', 'done', 'datetime'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'id';
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY ${sortColumn} ${order}`;
        query += ' LIMIT ? OFFSET ?';

        const offset = (page - 1) * parsedLimit;
        params.push(parsedLimit, parseInt(offset));

        const [results] = await connection.query(query, params);
        await connection.end();
        
        const tasks = results.map(task => ({
            ...task,
            done: Boolean(task.done),
            isLate: !task.done && new Date(task.datetime) < new Date()
        }));
        
        res.json({
            tasks: tasks,
            pagination: {
                page: parseInt(page),
                limit: parsedLimit,
                total: total,
                pages: Math.ceil(total / parsedLimit)
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


router.post('/', async (req, res) => {
    try {
        const { title, datetime } = req.body;

        if (!title) {
            return res.status(400).json({ 
                error: 'Le titre est requis',
                details: 'Le champ "title" ne peut pas être vide'
            });
        }

        if (typeof title !== 'string') {
            return res.status(400).json({ 
                error: 'Format de titre invalide',
                details: 'Le titre doit être une chaîne de caractères'
            });
        }

        if (title.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Titre invalide',
                details: 'Le titre ne peut pas contenir uniquement des espaces'
            });
        }

        if (title.length > 255) {
            return res.status(400).json({ 
                error: 'Titre trop long',
                details: 'Le titre ne peut pas dépasser 255 caractères'
            });
        }

        if (datetime) {
            if (typeof datetime !== 'string') {
                return res.status(400).json({ 
                    error: 'Format de date invalide',
                    details: 'La date doit être une chaîne de caractères'
                });
            }

            const parsedDate = new Date(datetime);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ 
                    error: 'Format de date invalide',
                    details: 'La date doit être dans un format valide (ex: YYYY-MM-DD, YYYY-MM-DD HH:MM:SS)'
                });
            }

            const minDate = new Date('2000-01-01');
            if (parsedDate < minDate) {
                return res.status(400).json({ 
                    error: 'Date invalide',
                    details: 'La date ne peut pas être antérieure au 01/01/2000'
                });
            }
        }

        const connection = await sql.getConnection();
        
        const taskDatetime = datetime ? new Date(datetime) : new Date();
        
        const [result] = await connection.query(
            'INSERT INTO task (title, done, description, datetime) VALUES (?, ?, ?, ?)', 
            [title.trim(), 0, '', taskDatetime] 
        );
        await connection.end();
        
        res.status(201).json({ 
            id: result.insertId, 
            title: title.trim(),
            datetime: taskDatetime,
            message: 'Tâche créée avec succès'
        });
        
    } catch (error) {
        console.error('Erreur détaillée POST:', error);
        
        if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
            return res.status(400).json({ 
                error: 'Erreur de format de données',
                details: 'Un des champs contient une valeur incompatible avec la base de données'
            });
        }
        
        if (error.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({ 
                error: 'Données trop longues',
                details: 'Un des champs dépasse la longueur maximale autorisée'
            });
        }
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                error: 'Tâche déjà existante',
                details: 'Une tâche avec le même titre existe déjà'
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur serveur lors de la création de la tâche',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Veuillez réessayer plus tard'
        });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { title, done, description } = req.body;

        if (!taskId || isNaN(parseInt(taskId)) || parseInt(taskId) <= 0) {
            return res.status(400).json({ 
                error: 'ID invalide',
                details: 'L\'ID de la tâche doit être un nombre positif'
            });
        }

        if (!title && done === undefined && description === undefined) {
            return res.status(400).json({ 
                error: 'Champs manquants',
                details: 'Au moins un champ à mettre à jour est requis (title, done ou description)' 
            });
        }

        const errors = [];

        if (title !== undefined) {
            if (typeof title !== 'string') {
                errors.push('Le titre doit être une chaîne de caractères');
            } else if (title.trim().length === 0) {
                errors.push('Le titre ne peut pas être vide');
            } else if (title.length > 255) {
                errors.push('Le titre ne peut pas dépasser 255 caractères');
            }
        }

        if (done !== undefined) {
            if (typeof done !== 'boolean') {
                errors.push('Le champ "done" doit être un booléen (true/false)');
            }
        }

        if (description !== undefined) {
            if (typeof description !== 'string') {
                errors.push('La description doit être une chaîne de caractères');
            } else if (description.length > 1000) {
                errors.push('La description ne peut pas dépasser 1000 caractères');
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ 
                error: 'Données invalides',
                details: errors
            });
        }

        const connection = await sql.getConnection();
        
        let query = 'UPDATE task SET ';
        const params = [];
        const updates = [];
        
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title.trim());
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
        params.push(parseInt(taskId));
        
        const [result] = await connection.query(query, params);
        await connection.end();
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                error: 'Tâche non trouvée',
                details: `Aucune tâche trouvée avec l'ID ${taskId}`
            });
        }
        
        const connection2 = await sql.getConnection();
        const [task] = await connection2.query('SELECT * FROM task WHERE id = ?', [taskId]);
        await connection2.end();
        
        if (task.length === 0) {
            return res.status(404).json({ 
                error: 'Tâche non trouvée après mise à jour',
                details: 'La tâche a été mise à jour mais n\'a pas pu être récupérée'
            });
        }
        
        const updatedTask = task[0];
        
        res.json({ 
            id: parseInt(taskId),
            title: updatedTask.title,
            done: Boolean(updatedTask.done), 
            description: updatedTask.description,
            datetime: updatedTask.datetime,
            message: 'Tâche mise à jour avec succès',
            updatedFields: {
                title: title !== undefined,
                done: done !== undefined,
                description: description !== undefined
            }
        });
        
    } catch (error) {
        console.error('Erreur détaillée PATCH:', error);
        
        if (error.code === 'ER_DATA_TOO_LONG') {
            return res.status(400).json({ 
                error: 'Données trop longues',
                details: 'Un des champs dépasse la longueur maximale autorisée'
            });
        }
        
        if (error.code === 'ER_TRUNCATED_WRONG_VALUE') {
            return res.status(400).json({ 
                error: 'Format de données invalide',
                details: 'Un des champs contient une valeur incompatible'
            });
        }
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                error: 'Conflit de données',
                details: 'Une tâche avec le même titre existe déjà'
            });
        }
        
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(400).json({ 
                error: 'Champ invalide',
                details: 'Un des champs spécifiés n\'existe pas dans la base de données'
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur serveur lors de la mise à jour',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Veuillez réessayer plus tard'
        });
    }
});

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