-- Script d'initialisation de la base de données
-- Création des utilisateurs de test

INSERT INTO users (email, nom, prenom, telephone, adresse, cin, hashed_password, role, is_active) VALUES
('admin@gestion.com', 'Admin', 'System', '0123456789', 'Adresse Admin', 'CIN001', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPJFCuFTu', 'ADMIN', true),
('secretaire@gestion.com', 'Dupont', 'Marie', '0123456790', 'Adresse Secrétaire', 'CIN002', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPJFCuFTu', 'SECRETAIRE', true),
('enseignant@gestion.com', 'Martin', 'Pierre', '0123456791', 'Adresse Enseignant', 'CIN003', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPJFCuFTu', 'ENSEIGNANT', true),
('fonctionnaire@gestion.com', 'Durand', 'Sophie', '0123456792', 'Adresse Fonctionnaire', 'CIN004', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPJFCuFTu', 'FONCTIONNAIRE', true);

-- Mot de passe pour tous les comptes de test: "password123"

-- Insertion de quelques enseignants
INSERT INTO enseignants (user_id, specialite, grade, etablissement) VALUES
(3, 'Mathématiques', 'Professeur Certifié', 'Lycée Al-Khawarizmi');

-- Insertion de quelques fonctionnaires
INSERT INTO fonctionnaires (user_id, service, poste, grade) VALUES
(4, 'Ressources Humaines', 'Gestionnaire RH', 'Catégorie A');
