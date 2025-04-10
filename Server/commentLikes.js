import pool from './database.js';

// Vérifier si une entrée existe dans une table donnée
async function existsInTable(tableName, columnName, value) {
  const [result] = await pool.query(`SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = ?`, [value]);
  return result.length > 0;
}

// Créer un like pour un commentaire
async function createLike(userId, mealId, commentId) {
  try {
    // Vérifier que l'utilisateur existe
    if (!(await existsInTable('user', 'id', userId))) {
      console.log("Utilisateur introuvable");
      return null;
    }

    // Vérifier que le plat existe
    if (!(await existsInTable('meals', 'mealId', mealId))) {
      console.log("Plat introuvable");
      return null;
    }

    // Vérifier que le commentaire existe
    if (!(await existsInTable('comments', 'commentId', commentId))) {
      console.log("Commentaire introuvable");
      return null;
    }

    // Ajouter le like dans la table commentLikes
    const [result] = await pool.query(
      'INSERT INTO commentLikes (userId, mealId, commentId) VALUES (?, ?, ?)',
      [userId, mealId, commentId]
    );

    console.log("Like ajouté à la table commentLikes");
    return result;
  } catch (error) {
    console.error('Erreur lors de la création du like :', error);
    throw error;
  }
}

// Ajouter un like à un commentaire et mettre à jour le compteur de likes
async function addLikeToComment(commentId, userId, mealId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Vérifier si le like existe déjà
    const [existingLike] = await connection.query(
      'SELECT * FROM commentLikes WHERE commentId = ? AND userId = ?',
      [commentId, userId]
    );

    if (existingLike.length > 0) {
      throw new Error('Like déjà existant');
    }

    // Vérifier l'existence du commentaire
    const [commentExists] = await connection.query(
      'SELECT * FROM comments WHERE commentId = ?',
      [commentId]
    );

    if (commentExists.length === 0) {
      throw new Error('Commentaire introuvable');
    }

    // Ajouter le like dans la table commentLikes
    await connection.query(
      'INSERT INTO commentLikes (userId, mealId, commentId) VALUES (?, ?, ?)',
      [userId, mealId, commentId]
    );

    // Mettre à jour le compteur de likes dans la table comments
    await connection.query(
      'UPDATE comments SET likes = likes + 1 WHERE commentId = ?',
      [commentId]
    );

    await connection.commit();
    console.log("Like ajouté et compteur mis à jour avec succès.");
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error('Transaction annulée :', error.message);
    throw error;
  } finally {
    connection.release();
  }
}


  async function removeLikeFromComment(commentId, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
      // Vérifier l'existence du like
      const [existingLike] = await connection.query(
        'SELECT * FROM commentLikes WHERE commentId = ? AND userId = ?',
        [commentId, userId]
      );
  
      if (existingLike.length === 0) {
        throw new Error('Like introuvable');
      }
  
      // Opérations atomiques
      await connection.query(
        'DELETE FROM commentLikes WHERE commentId = ? AND userId = ?',
        [commentId, userId]
      );
  
      await connection.query(
        'UPDATE comments SET likes = likes - 1 WHERE commentId = ?',
        [commentId]
      );
  
      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      console.error('Transaction annulée :', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
  
  

// Fonction principale pour tester
(async () => {
  try {
    const like1 = await addLikeToComment(7, "paul.emptoz@telecom-sudparis.eu", 1);

    if (like1) {
      console.log("Like créé :", like1);
    } else {
      console.log("Le like n'a pas pu être créé.");
    }
  } catch (error) {
    console.error('Erreur dans la fonction principale :', error);
  } finally {
    pool.end(); // Fermer le pool de connexions
  }
})();
