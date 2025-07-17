document.addEventListener('DOMContentLoaded', () => {
    // Configuration de Tailwind CSS pour utiliser les couleurs personnalisées
    // Cette partie est normalement dans le <head> de l'HTML, mais pour une séparation stricte,
    // on la met ici. Assurez-vous que le CDN Tailwind est chargé AVANT ce script.
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'bleu-nuit': '#1A2B4D',
                    'bleu-azur': '#4A90E2',
                    'violet-digital': '#7B5BAA',
                    'blanc-pur': '#FFFFFF',
                },
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                }
            }
        }
    };

    // Sélectionne tous les liens de navigation, y compris le bouton "Demander un Devis" dans le header
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const heroCarousel = document.querySelector('.hero-background-carousel');
    const heroImages = document.querySelectorAll('.hero-background-carousel img');
    let currentImageIndex = 0;

    // Fonction pour afficher une page spécifique
    const showPage = (id) => {
        console.log(`Navigating to section: ${id}`); // Ajout d'un log pour le débogage
        contentSections.forEach(section => {
            section.style.display = 'none'; // Cache toutes les sections
        });
        const targetSection = document.getElementById(id);
        if (targetSection) {
            targetSection.style.display = 'block'; // Affiche la section cible
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Défilement doux vers le haut de la page
        }
    };

    // Écouteurs d'événements pour les liens de navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche le comportement par défaut de l'ancre
            const targetId = link.getAttribute('href').substring(1); // Récupère l'ID cible depuis le href
            showPage(targetId);
        });
    });

    // Chargement initial de la page en fonction du hash de l'URL ou par défaut sur 'accueil'
    const initialHash = window.location.hash.substring(1);
    if (initialHash && document.getElementById(initialHash)) {
        showPage(initialHash);
    } else {
        showPage('accueil'); // Par défaut sur la page d'accueil
    }

    // Logique du carrousel d'arrière-plan de la section Hero
    if (heroCarousel && heroImages.length > 1) {
        setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % heroImages.length;
            const offset = -currentImageIndex * 100;
            heroCarousel.style.transform = `translateX(${offset}%)`;
        }, 5000); // Change l'image toutes les 5 secondes
    }

    // --- Logique de soumission des formulaires de devis et de contact ---

    // Gérer la soumission du formulaire de devis
    const devisForm = document.getElementById('devisForm');
    const devisMessageDiv = document.getElementById('devisMessage');

    if (devisForm) {
        devisForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêche la soumission par défaut du formulaire

            // Validation côté client de base
            const name = document.getElementById('devis-name').value;
            const email = document.getElementById('devis-email').value;
            const service = document.getElementById('devis-service').value;
            const message = document.getElementById('devis-message').value;

            if (!name || !email || !service || !message) {
                devisMessageDiv.textContent = 'Veuillez remplir tous les champs obligatoires.';
                devisMessageDiv.className = 'block p-3 mb-4 rounded-lg text-center bg-red-100 text-red-700';
                return;
            }

            // Prépare les données du formulaire pour la soumission à Formspree
            const formData = new FormData(devisForm);

            try {
                const response = await fetch(devisForm.action, {
                    method: devisForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Important pour que Formspree retourne du JSON
                    }
                });

                if (response.ok) { // Vérifie si la réponse a réussi (statut 200-299)
                    devisMessageDiv.textContent = 'Votre demande de devis a été envoyée avec succès ! Nous vous contacterons bientôt.';
                    devisMessageDiv.className = 'block p-3 mb-4 rounded-lg text-center bg-green-100 text-green-700';
                    devisForm.reset(); // Efface le formulaire
                } else {
                    // Gère les erreurs de Formspree (ex: limitation de débit, ID de formulaire invalide)
                    const data = await response.json();
                    if (data.errors) {
                        devisMessageDiv.textContent = 'Erreur lors de l\'envoi : ' + data.errors.map(err => err.message).join(', ');
                    } else {
                        devisMessageDiv.textContent = 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.';
                    }
                    devisMessageDiv.className = 'block p-3 mb-4 rounded-lg text-center bg-red-100 text-red-700';
                }
            } catch (error) {
                console.error('Erreur réseau ou autre:', error);
                devisMessageDiv.textContent = 'Une erreur de connexion est survenue. Veuillez vérifier votre connexion internet et réessayer.';
                devisMessageDiv.className = 'block p-3 mb-4 rounded-lg text-center bg-red-100 text-red-700';
            }

            // Cache le message après quelques secondes
            setTimeout(() => {
                devisMessageDiv.classList.add('hidden');
            }, 5000);
        });
    }

    // Gérer la soumission du formulaire de contact (logique similaire)
    const contactForm = document.getElementById('contactForm');
    const contactMessageDiv = document.getElementById('contactMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêche la soumission par défaut du formulaire

            // Validation côté client de base
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').val