import pool from './database.js';

async function addLikeToMeal(mealId, userId) {
    // Vérifier si le plat existe
    const [mealExists] = await pool.query(`
        SELECT * FROM meals WHERE mealId = ?
    `, [mealId]);

    if (mealExists.length === 0) {
        console.log("Plat introuvable");
        return null;
    }

    // Vérifier si l'utilisateur existe
    const [userExists] = await pool.query(`
        SELECT * FROM user WHERE id = ?
    `, [userId]);

    if (userExists.length === 0) {
        console.log("Utilisateur introuvable");
        return null;
    }

    // Ajouter un like dans la table mealLikes (si elle existe)
    const [alreadyLiked] = await pool.query(`
        SELECT * FROM likes WHERE mealId = ? AND userId = ?
    `, [mealId, userId]);

    if (alreadyLiked.length > 0) {
        console.log("Vous avez déjà liké ce plat");
        return null;
    }

    await pool.query(`
        INSERT INTO likes (mealId, userId)
        VALUES (?, ?)
    `, [mealId, userId]);
    console.log("Like ajouté dans la table mealLikes");

    // Mettre à jour le compteur de likes dans la table meals
    await pool.query(`
        UPDATE meals
        SET likes = likes + 1
        WHERE mealId = ?
    `, [mealId]);
    
    console.log("Compteur de likes mis à jour pour le plat");
    
    return { success: true, message: "Like ajouté avec succès" };
}

async function removeLikeFromMeal(mealId, userId) {
    // Vérifier si le plat existe
    const [mealExists] = await pool.query(`
        SELECT * FROM meals WHERE mealId = ?
    `, [mealId]);

    if (mealExists.length === 0) {
        console.log("Plat introuvable");
        return null;
    }

    // Vérifier si l'utilisateur a liké ce plat
    const [alreadyLiked] = await pool.query(`
        SELECT * FROM likes WHERE mealId = ? AND userId = ?
    `, [mealId, userId]);

    if (alreadyLiked.length === 0) {
        console.log("Vous n'avez pas liké ce plat");
        return null;
    }

    // Supprimer le like de la table mealLikes
    await pool.query(`
        DELETE FROM likes WHERE mealId = ? AND userId = ?
    `, [mealId, userId]);
    console.log("Like supprimé de la table mealLikes");

    // Décrémenter le compteur de likes dans la table meals
    await pool.query(`
        UPDATE meals
        SET likes = likes - 1
        WHERE mealId = ?
    `, [mealId]);
    
    console.log("Compteur de likes décrémenté pour le plat");
    
    return { success: true, message: "Like retiré avec succès" };
}


// Exemple d'utilisation
async function main() {
    const result = await addLikeToMeal(1, "paul.emptoz@telecom-sudparis.eu");
    
    if (result) {
        console.log(result.message);
    } else {
        console.log("Le like n'a pas pu être ajouté.");
    }

    
    const result2 = await removeLikeFromMeal(1, "paul.emptoz@telecom-sudparis.eu");
    
    if (result2) {
        console.log(result2.message);
    } else {
        console.log("Le like n'a pas pu être retiré.");
    }
    
    pool.end(); // Fermer le pool de connexions
}

main();
