import sqlite3

conn = sqlite3.connect('gestion_db.db')
cursor = conn.cursor()
cursor.execute("SELECT id, nom, prenom, email, role FROM users WHERE email LIKE '%mariam%'")
results = cursor.fetchall()
print("Utilisateurs avec 'mariam' dans l'email:")
for row in results:
    print(f"ID: {row[0]}, Nom: {row[1]} {row[2]}, Email: {row[3]}, Role: {row[4]}")
conn.close()
