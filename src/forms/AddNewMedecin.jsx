import {
    CircleUserRound,
    ClipboardList,
    ShieldUser,
    UserCog,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    addMedecin,
    clearAddError,
    clearAddSuccess,
    selectAddMedecinError,
    selectAddMedecinSuccess,
    selectAddMedecinStatus
} from "../redux/MedecinSlice"; // Ajustez le chemin selon votre structure
import { getAllServices, selectServicesList } from "../redux/ServiceSlice";
import toast, { Toaster } from "react-hot-toast";

export default function AddNewMedecin({ aff }) {
    // ==================== ÉTATS LOCAUX ====================
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [dateNaissance, setDateNaissance] = useState("");
    const [lieuNaissance, setLieuNaissance] = useState("");
    const [telephone, setTelephone] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [service, setService] = useState("");
    const [poste, setPoste] = useState("");
    const [domicile, setDomicile] = useState("");
    const [ville, setVille] = useState("");
    const [matricule, setMatricule] = useState("");

    // État pour gérer les erreurs de validation côté client
    const [validationErrors, setValidationErrors] = useState({});

    // État pour indiquer si le formulaire est en cours de soumission
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ==================== HOOKS REDUX ====================
    const dispatch = useDispatch();
    const addError = useSelector(selectAddMedecinError);
    const addSuccess = useSelector(selectAddMedecinSuccess);
    const addStatus = useSelector(selectAddMedecinStatus);
    const services = useSelector(selectServicesList);

    // ==================== EFFETS ====================

    // Nettoyer les erreurs et succès au montage du composant
    useEffect(() => {
        dispatch(clearAddError());
        dispatch(clearAddSuccess());
    }, [dispatch]);

    // Gérer l'affichage des toasts et la fermeture du formulaire
    useEffect(() => {
        if (addSuccess) {
            toast.success(addSuccess);

            // Fermer le formulaire après le toast
            const timer = setTimeout(() => {
                dispatch(clearAddSuccess());
                aff(false); // Fermer le formulaire
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [addSuccess, dispatch, aff]);

    // Gérer l'affichage des erreurs avec toast
    useEffect(() => {
        if (addError) {
            toast.error(addError);

            // Nettoyer l'erreur après l'affichage
            const timer = setTimeout(() => {
                dispatch(clearAddError());
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [addError, dispatch]);

    // Réinitialiser l'état de soumission quand l'opération est terminée
    useEffect(() => {
        if (addStatus === 'succeeded' || addStatus === 'failed') {
            setIsSubmitting(false);
        }
    }, [addStatus]);

    useEffect(() => {
        dispatch(getAllServices())
    }, [dispatch]);

    // ==================== FONCTIONS DE VALIDATION ====================

    /**
     * Valide les champs obligatoires du formulaire
     * @returns {Object} Objet contenant les erreurs de validation
     */
    const validateForm = () => {
        const errors = {};

        // Validation des champs obligatoires
        if (!nom.trim()) errors.nom = "Le nom est obligatoire";
        if (!prenom.trim()) errors.prenom = "Le prénom est obligatoire";
        if (!email.trim()) errors.email = "L'email est obligatoire";
        if (!matricule.trim()) errors.matricule = "Le matricule est obligatoire";
        if (!password.trim()) errors.password = "Le mot de passe est obligatoire";

        // Validation du format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) {
            errors.email = "Format d'email invalide";
        }

        // Validation de la longueur du mot de passe
        if (password && password.length < 6) {
            errors.password = "Le mot de passe doit contenir au moins 6 caractères";
        }

        // Validation du téléphone si fourni
        if (telephone && !/^\d{8,}$/.test(telephone.replace(/\s/g, ''))) {
            errors.telephone = "Le téléphone doit contenir au moins 8 chiffres";
        }

        return errors;
    };

    // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================

    /**
     * Gère la soumission du formulaire
     * @param {Event} e - Événement de soumission du formulaire
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Nettoyer les erreurs précédentes
        setValidationErrors({});
        dispatch(clearAddError());

        // Valider le formulaire
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error("Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        // Marquer le formulaire comme en cours de soumission
        setIsSubmitting(true);

        // Préparer les données du médecin
        const medecinData = {
            nom: nom.trim(),
            prenom: prenom.trim(),
            dateNaissance: dateNaissance || null,
            lieuNaissance: lieuNaissance.trim() || null,
            telephone: telephone.trim() || null,
            email: email.trim(),
            password: password.trim(),
            service: service.trim() || null,
            poste: poste.trim() || null,
            domicile: domicile.trim() || null,
            ville: ville.trim() || null,
            matricule: matricule.trim()
        };

        try {
            // Dispatching de l'action d'ajout
            await dispatch(addMedecin(medecinData)).unwrap();

            // Si succès, réinitialiser le formulaire
            resetForm();

        } catch (error) {
            // L'erreur est déjà gérée par le slice et sera affichée via useEffect
            console.error("Erreur lors de l'ajout du médecin:", error);
        }
    };

    /**
     * Réinitialise tous les champs du formulaire
     */
    const resetForm = () => {
        setNom("");
        setPrenom("");
        setDateNaissance("");
        setLieuNaissance("");
        setTelephone("");
        setEmail("");
        setPassword("");
        setService("");
        setPoste("");
        setDomicile("");
        setVille("");
        setMatricule("");
        setValidationErrors({});
    };

    /**
     * Gère l'annulation du formulaire
     */
    const handleCancel = () => {
        // Nettoyer les erreurs et succès avant de fermer
        dispatch(clearAddError());
        dispatch(clearAddSuccess());
        resetForm();
        aff(false);
    };

    // ==================== FONCTIONS UTILITAIRES ====================

    /**
     * Retourne la classe CSS pour un champ en erreur
     * @param {string} fieldName - Nom du champ
     * @returns {string} Classe CSS
     */
    const getFieldErrorClass = (fieldName) => {
        return validationErrors[fieldName] ? 'error' : '';
    };

    /**
     * Génère un matricule automatique basé sur les données du médecin
     */
    const generateMatricule = () => {
        if (nom && prenom && service) {
            const matriculeGenerated = `${nom.substring(0, 2).toUpperCase()}${prenom.substring(0, 2).toUpperCase()}${service.substring(0, 2).toUpperCase()}${Date.now().toString().slice(-4)}`;
            setMatricule(matriculeGenerated);
            toast.success("Matricule généré avec succès !");
        } else {
            toast.error("Veuillez renseigner le nom, prénom et service avant de générer le matricule");
        }
    };

    // ==================== RENDU ====================

    return (
        <>
            <div className='containers-params-add'>
                <div className='section-new-patient center'>
                    <p className='pp'>
                        <ClipboardList size={30} />
                        <span>Formulaire d'ajout d'un médecin</span>
                    </p>

                    <form onSubmit={handleSubmit}>
                        {/* ==================== INFORMATIONS PERSONNELLES ==================== */}
                        <div className='information personnel'>
                            <div className='part-description'>
                                <h3>
                                    <CircleUserRound />
                                    <span>Information Personnel</span>
                                </h3>
                                <p>
                                    Renseignez les informations personnelles du médecin.
                                    Les champs marqués d'un astérisque (*) sont obligatoires.
                                </p>
                            </div>
                            <div className='part-form'>
                                <section>
                                    <div className='info'>
                                        <label htmlFor='nom'>Nom Médecin *</label>
                                        <input
                                            type='text'
                                            id='nom'
                                            value={nom}
                                            onChange={(e) => setNom(e.target.value)}
                                            className={getFieldErrorClass('nom')}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.nom && (
                                            <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>
                                                {validationErrors.nom}
                                            </span>
                                        )}
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='prenom'>Prénom Médecin *</label>
                                        <input
                                            type='text'
                                            id='prenom'
                                            value={prenom}
                                            onChange={(e) => setPrenom(e.target.value)}
                                            className={getFieldErrorClass('prenom')}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.prenom && (
                                            <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>
                                                {validationErrors.prenom}
                                            </span>
                                        )}
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='dateNaissance'>Date de Naissance</label>
                                        <input
                                            type='date'
                                            id='dateNaissance'
                                            value={dateNaissance}
                                            onChange={(e) => setDateNaissance(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='lieuNaissance'>Lieu de Naissance</label>
                                        <input
                                            type='text'
                                            id='lieuNaissance'
                                            value={lieuNaissance}
                                            onChange={(e) => setLieuNaissance(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='telephone'>Téléphone</label>
                                        <input
                                            type='tel'
                                            id='telephone'
                                            value={telephone}
                                            onChange={(e) => setTelephone(e.target.value)}
                                            className={getFieldErrorClass('telephone')}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.telephone && (
                                            <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>
                                                {validationErrors.telephone}
                                            </span>
                                        )}
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='ville'>Ville</label>
                                        <input
                                            type='text'
                                            id='ville'
                                            value={ville}
                                            onChange={(e) => setVille(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='domicile'>Domicile</label>
                                        <input
                                            type='text'
                                            id='domicile'
                                            value={domicile}
                                            onChange={(e) => setDomicile(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* ==================== INFORMATIONS MÉDICALES ==================== */}
                        <div className='information medicale'>
                            <div className='part-description'>
                                <h3>
                                    <UserCog />
                                    <span>Information Médicale</span>
                                </h3>
                                <p>
                                    Renseignez les informations professionnelles du médecin
                                    concernant son service et son poste au sein de l'hôpital.
                                </p>
                            </div>
                            <div className='part-form'>
                                <section>
                                    <div className='info'>
                                        <label htmlFor='service'>Service Médical</label>
                                        <select name="" id="" onChange={(e) => setService(e.target.value)}>
                                            <option value="">choisir le service</option>
                                            {services.map((service, index) => (
                                                <option key={index} value={service.nom}>{service.nom}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='info'>
                                        <label htmlFor='poste'>Poste au sein de l'hôpital</label>
                                        <input
                                            type='text'
                                            id='poste'
                                            value={poste}
                                            onChange={(e) => setPoste(e.target.value)}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* ==================== INFORMATIONS DE SÉCURITÉ ==================== */}
                        <div className='information sécurite'>
                            <div className='part-description'>
                                <h3>
                                    <ShieldUser />
                                    <span>Information de sécurité</span>
                                </h3>
                                <p>
                                    Renseignez les informations de connexion du médecin.
                                    Ces informations sont nécessaires pour l'accès au système.
                                </p>
                            </div>
                            <div className='part-form'>
                                <div className='info'>
                                    <label htmlFor='email'>Email *</label>
                                    <input
                                        type='email'
                                        id='email'
                                        placeholder='Entrez votre email'
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={getFieldErrorClass('email')}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.email && (
                                        <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>
                                            {validationErrors.email}
                                        </span>
                                    )}
                                </div>
                                <div className='info'>
                                    <label htmlFor='password'>Mot de passe *</label>
                                    <input
                                        type='password'
                                        id='password'
                                        placeholder='Entrez votre mot de passe'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={getFieldErrorClass('password')}
                                        disabled={isSubmitting}
                                    />
                                    {validationErrors.password && (
                                        <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>
                                            {validationErrors.password}
                                        </span>
                                    )}
                                </div>
                                <div className='info'>
                                    <label htmlFor='matricule'>Matricule *</label>
                                    <div className="matricule-input">
                                        <input
                                            type='text'
                                            id='matricule'
                                            placeholder='Matricule du médecin'
                                            value={matricule}
                                            onChange={(e) => setMatricule(e.target.value)}
                                            className={getFieldErrorClass('matricule')}
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type='button'
                                            onClick={generateMatricule}
                                            disabled={isSubmitting || !nom || !prenom || !service}
                                            style={{
                                                padding: '5px 10px',
                                                fontSize: '12px',
                                                opacity: (!nom || !prenom || !service) ? '0.5' : '1'
                                            }}
                                        >
                                            Générer
                                        </button>
                                    </div>
                                    {validationErrors.matricule && (
                                        <span className="error-text" style={{ color: 'red', fontSize: '12px' }}>
                                            {validationErrors.matricule}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ==================== BOUTONS D'ACTION ==================== */}
                        <div className='btns'>
                            <button
                                type='button'
                                className='cancel'
                                onClick={handleCancel}
                                disabled={isSubmitting}
                            >
                                Annuler
                            </button>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                style={{
                                    opacity: isSubmitting ? '0.7' : '1',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Ajout en cours...' : 'Confirmer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={8}
                containerClassName=""
                containerStyle={{}}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        fontFamily: 'font-principal',
                        fontSize: '14px',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: 'white',
                            secondary: '#10b981',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#ef4444',
                            color: 'white',
                        },
                        iconTheme: {
                            primary: 'white',
                            secondary: '#ef4444',
                        },
                    },
                }}
            />
        </>
    );
}