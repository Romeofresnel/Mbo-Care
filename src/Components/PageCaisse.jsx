import { ChevronRight, Eye, Plus, Printer, Receipt, SquarePen, Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import AddFActure from '../forms/AddFActure'
import { useSelector, useDispatch } from 'react-redux'
import {
    getCaissesByPatient,
    selectCaissesByPatient,
    selectCaisseStatus,
    selectCaisseErrors,
    clearGetByPatientError,
    deleteCaisse,
    selectDeleteCaisseError,
    selectDeleteCaisseSuccess,
    clearDeleteError,
    clearDeleteSuccess
} from '../redux/CaisseSlice'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import EditFacture from '../forms/EditFacture'
import EditFacture1 from '../forms/EditFacture1'

// Initialisation de SweetAlert2 avec React
const MySwal = withReactContent(Swal)

export default function PageCaisse({ aff, patient }) {
    // État local pour gérer l'affichage du formulaire d'ajout
    const [aff1, setAff1] = useState(false)
    const [aff2, setAff2] = useState(false)
    const [aff3, setAff3] = useState(false)
    const [patient1, setPatient1] = useState()
    const [fac, setFac] = useState()

    // Sélecteurs Redux pour récupérer les données du store
    const caisses = useSelector(selectCaissesByPatient)
    const status = useSelector(selectCaisseStatus)
    const errors = useSelector(selectCaisseErrors)
    const deleteError = useSelector(selectDeleteCaisseError)
    const deleteSuccess = useSelector(selectDeleteCaisseSuccess)
    const dispatch = useDispatch()

    // Fonction pour formater les montants en FCFA
    const formatMontant = (montant) => {
        if (!montant && montant !== 0) return 'N/A'
        return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
    }

    // Fonction pour formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch (error) {
            console.error('Erreur lors du formatage de la date:', error)
            return 'Date invalide'
        }
    }

    // Fonction pour déterminer le libellé du type de caisse
    const getTypeLibelle = (type) => {
        const types = {
            'frais_hospitalisation': 'Frais d\'hospitalisation',
            'consultation': 'Consultation',
            'medicaments': 'Médicaments',
            'examens': 'Examens',
            'soins': 'Soins',
            'autres': 'Autres'
        }
        return types[type] || type || 'Type non spécifié'
    }

    // Fonction pour imprimer une facture
    const handlePrintFacture = (caisse) => {
        try {
            const factureData = {
                libelle: caisse.libelle || 'Libellé non spécifié',
                type: getTypeLibelle(caisse.type),
                montant: caisse.montant || 0,
                date: formatDate(caisse.dateCreation || caisse.createdAt)
            }

            const printContent = `
                <html>
                    <head>
                        <title>Facture - ${factureData.libelle}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                margin: 20px; 
                                line-height: 1.6;
                            }
                            .header { 
                                text-align: center; 
                                border-bottom: 2px solid #333; 
                                padding-bottom: 10px; 
                                margin-bottom: 20px; 
                            }
                            .patient-info { 
                                margin-bottom: 20px; 
                                padding: 15px;
                                background-color: #f9f9f9;
                                border-radius: 5px;
                            }
                            .facture-details { 
                                margin-bottom: 20px; 
                            }
                            .amount { 
                                font-size: 18px; 
                                font-weight: bold; 
                                color: #333; 
                            }
                            .footer { 
                                margin-top: 30px; 
                                text-align: center; 
                                font-size: 12px; 
                                color: #666; 
                                border-top: 1px solid #ddd;
                                padding-top: 15px;
                            }
                            table { 
                                width: 100%; 
                                border-collapse: collapse; 
                                margin-top: 10px;
                            }
                            th, td { 
                                border: 1px solid #ddd; 
                                padding: 12px; 
                                text-align: left; 
                            }
                            th { 
                                background-color: #f2f2f2; 
                                font-weight: bold;
                            }
                            .logo {
                                margin-bottom: 20px;
                            }
                            .highlight {
                                background-color: #e8f5e8;
                                padding: 10px;
                                border-radius: 5px;
                                margin: 15px 0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <div class="logo">
                                <h1>FACTURE MÉDICALE</h1>
                                <p>Système de Gestion Hospitalière</p>
                            </div>
                            <p><strong>Date d'impression:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                        
                        <div class="patient-info">
                            <h3>📋 Informations Patient</h3>
                            <p><strong>Nom complet:</strong> ${patient?.nom || 'N/A'} ${patient?.prenom || 'N/A'}</p>
                            <p><strong>ID Patient:</strong> ${patient?._id || 'N/A'}</p>
                            <p><strong>Date de consultation:</strong> ${factureData.date}</p>
                        </div>
                        
                        <div class="facture-details">
                            <h3>💰 Détails de la Facture</h3>
                            <table>
                                <tr>
                                    <th>Libellé</th>
                                    <td>${factureData.libelle}</td>
                                </tr>
                                <tr>
                                    <th>Type de service</th>
                                    <td>${factureData.type}</td>
                                </tr>
                                <tr>
                                    <th>Date de création</th>
                                    <td>${factureData.date}</td>
                                </tr>
                                <tr>
                                    <th>Montant total</th>
                                    <td class="amount">${formatMontant(factureData.montant)}</td>
                                </tr>
                            </table>
                        </div>
                        
                        <div class="highlight">
                            <h4>💡 Informations importantes</h4>
                            <p>• Cette facture est générée automatiquement par le système</p>
                            <p>• Conservez cette facture pour vos dossiers médicaux</p>
                            <p>• Pour toute question, contactez l'administration</p>
                        </div>
                        
                        <div class="footer">
                            <p>Facture générée automatiquement le ${new Date().toLocaleString('fr-FR')}</p>
                            <p>Système de Gestion Hospitalière - Version 1.0</p>
                        </div>
                    </body>
                </html>
            `;

            // Créer une nouvelle fenêtre pour l'impression
            const printWindow = window.open('', '_blank', 'width=800,height=600');

            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();

                // Attendre que le contenu soit chargé avant d'imprimer
                printWindow.onload = function () {
                    printWindow.focus();
                    printWindow.print();

                    // Optionnel : fermer la fenêtre après impression
                    setTimeout(() => {
                        printWindow.close();
                    }, 100);
                };
            } else {
                // Fallback si la fenêtre popup est bloquée
                MySwal.fire({
                    title: 'Popup bloqué',
                    text: 'Votre navigateur bloque les fenêtres popup. Veuillez autoriser les popups pour imprimer.',
                    icon: 'warning',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'impression:', error);
            MySwal.fire({
                title: 'Erreur d\'impression',
                text: 'Une erreur s\'est produite lors de la génération de la facture.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }
    }

    // Fonction pour gérer la suppression d'une caisse avec confirmation
    const handleDeleteCaisse = async (caisse) => {
        try {
            const result = await MySwal.fire({
                title: 'Confirmer la suppression',
                html: `
                    <div style="text-align: left; margin: 20px 0;">
                        <p><strong>Êtes-vous sûr de vouloir supprimer cette caisse ?</strong></p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <p><strong>Libellé:</strong> ${caisse.libelle || 'N/A'}</p>
                            <p><strong>Type:</strong> ${getTypeLibelle(caisse.type)}</p>
                            <p><strong>Montant:</strong> ${formatMontant(caisse.montant)}</p>
                            <p><strong>Date:</strong> ${formatDate(caisse.dateCreation || caisse.createdAt)}</p>
                        </div>
                        <p style="color: #dc3545; font-weight: 500;">
                            <i class="fas fa-exclamation-triangle"></i>
                            Cette action est irréversible !
                        </p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                focusCancel: true,
                customClass: {
                    popup: 'swal-wide',
                    title: 'swal-title',
                    content: 'swal-content'
                }
            })

            if (result.isConfirmed) {
                // Afficher un loader pendant la suppression
                MySwal.fire({
                    title: 'Suppression en cours...',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        MySwal.showLoading()
                    }
                })

                // Déclencher la suppression via Redux
                await dispatch(deleteCaisse(caisse._id)).unwrap()
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error)
            // L'erreur sera gérée par l'effet useEffect qui surveille deleteError
        }
    }

    // Fonction pour gérer la fermeture du formulaire d'ajout
    const handleCloseAddForm = () => {
        setAff1(false)
        // Optionnel : recharger les caisses après ajout pour s'assurer de la synchronisation
        if (patient?._id) {
            dispatch(getCaissesByPatient(patient._id))
        }
    }

    // Fonction pour nettoyer les erreurs
    const handleClearError = () => {
        dispatch(clearGetByPatientError())
    }

    // Effet pour charger les caisses du patient au montage du composant
    useEffect(() => {
        console.log('PageCaisse - Chargement des caisses pour le patient:', patient?._id)

        if (patient?._id) {
            // Nettoyer les erreurs précédentes avant de charger
            dispatch(clearGetByPatientError())
            // Charger les caisses du patient
            dispatch(getCaissesByPatient(patient._id))
        }
    }, [dispatch, patient?._id])

    // Effet pour suivre les changements dans les caisses
    useEffect(() => {
        console.log('PageCaisse - Caisses mises à jour:', caisses)
        console.log('PageCaisse - Statut:', status)
        console.log('PageCaisse - Erreurs:', errors)
    }, [caisses, status, errors])

    // Effet pour gérer les messages de succès et d'erreur de suppression
    useEffect(() => {
        if (deleteSuccess) {
            MySwal.fire({
                title: 'Suppression réussie !',
                text: 'La caisse a été supprimée avec succès.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                timer: 3000,
                timerProgressBar: true
            }).then(() => {
                // Nettoyer le message de succès
                dispatch(clearDeleteSuccess())
                // Recharger les caisses pour s'assurer de la synchronisation
                if (patient?._id) {
                    dispatch(getCaissesByPatient(patient._id))
                }
            })
        }

        if (deleteError) {
            MySwal.fire({
                title: 'Erreur de suppression',
                text: deleteError,
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'Fermer'
            }).then(() => {
                // Nettoyer l'erreur
                dispatch(clearDeleteError())
            })
        }
    }, [deleteSuccess, deleteError, dispatch, patient?._id])

    // Rendu du composant de chargement
    const renderLoading = () => (
        <div className='info'>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Chargement des caisses...</p>
            </div>
        </div>
    )

    // Rendu du composant d'erreur
    const renderError = () => (
        <div className='info'>
            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                <p>Erreur: {errors.getByPatient}</p>
                <button
                    onClick={handleClearError}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Réessayer
                </button>
            </div>
        </div>
    )

    // Rendu du composant de liste vide
    const renderEmptyList = () => (
        <div className='info'>
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Aucune caisse trouvée pour ce patient.</p>
                <button
                    onClick={() => setAff1(true)}
                    style={{
                        marginTop: '10px',
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Ajouter la première caisse
                </button>
            </div>
        </div>
    )

    // Rendu d'une ligne de caisse
    const renderCaisseRow = (caisse) => {
        if (!caisse) return null

        return (
            <div key={caisse._id} className='info'>
                <ul>
                    <section>
                        <li>
                            <Receipt />
                            <span>{caisse.libelle || 'Libellé non spécifié'}</span>
                        </li>
                        <li>
                            <span>{getTypeLibelle(caisse.type)}</span>
                        </li>
                        <li>{formatMontant(caisse.montant)}</li>
                        <li>{formatDate(caisse.dateCreation || caisse.createdAt)}</li>
                    </section>
                    <li>
                        <p title="Voir les détails" onClick={() => {
                            setAff3(true)
                            setFac(caisse)
                            setPatient1(patient)
                        }}>
                            <Eye />
                        </p>
                        <p
                            title="Imprimer la facture"
                            onClick={() => handlePrintFacture(caisse)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Printer />
                        </p>
                        <p title="Modifier" onClick={() => {
                            setAff2(true)
                            setFac(caisse)
                            setPatient1(patient)
                        }}>
                            <SquarePen />
                        </p>
                        <p
                            title="Supprimer"
                            onClick={() => handleDeleteCaisse(caisse)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Trash />
                        </p>
                    </li>
                </ul>
            </div>
        )
    }

    // Rendu du contenu principal en fonction du statut
    const renderContent = () => {
        // Affichage du chargement
        if (status === 'loading') {
            return renderLoading()
        }

        // Affichage des erreurs
        if (status === 'failed' && errors.getByPatient) {
            return renderError()
        }

        // Vérification si les caisses sont un tableau valide
        if (!Array.isArray(caisses)) {
            console.warn('Les caisses ne sont pas un tableau valide:', caisses)
            return renderEmptyList()
        }

        // Affichage de la liste vide
        if (caisses.length === 0) {
            return renderEmptyList()
        }

        // Affichage de la liste des caisses
        return caisses.map(caisse => renderCaisseRow(caisse))
    }

    // Calcul du nombre total de caisses
    const totalCaisses = Array.isArray(caisses) ? caisses.length : 0

    return (
        <>
            <div className='gestion-option-container'>
                <div className='entete tete' onClick={() => aff(false)}>
                    Caisse
                    <ChevronRight />
                    Factures de {patient?.nom || 'Patient'} {patient?.prenom || ''}
                </div>
                <div className='body'>
                    <div className='navigation'>
                        {/* Navigation vide pour le moment */}
                    </div>
                    <div className='container-data'>
                        <div className="view-content">
                            <div className='top'>
                                <p>
                                    Toutes les caisses
                                    <span>{totalCaisses.toString().padStart(3, '0')}</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setAff1(true)}
                                    disabled={status === 'loading'}
                                >
                                    <Plus />
                                    <span>Ajouter une facture</span>
                                </button>
                            </div>
                            <div className='bottom'>
                                <div className='nav'>
                                    <ul>
                                        <section>
                                            <li>Libellé</li>
                                            <li>Type Facture</li>
                                            <li>Montant</li>
                                            <li>Date de création</li>
                                        </section>
                                        <li>Options</li>
                                    </ul>
                                </div>
                                <div className='data'>
                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire d'ajout de caisse */}
            {aff1 && (
                <AddFActure
                    aff={handleCloseAddForm}
                    patient={patient}
                />
            )}
            {aff2 && (<EditFacture aff={setAff2} patient={patient1} factureData={fac} />)}
            {aff3 && (<EditFacture1 aff={setAff3} patient={patient1} factureData={fac} />)}
        </>
    )
}
