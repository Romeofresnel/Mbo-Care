import { Bed, BedSingle, Blocks, Eye, Hospital, Plus, SquarePen, Trash } from 'lucide-react'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import NewService from '../forms/NewService'
import NewChambre from '../forms/NewChambre'

// Import des actions et sélecteurs Redux
import {
  getAllServices,
  deleteService,
  selectServicesList,
  selectServiceStatus,
  selectServiceErrors,
  selectServiceSuccessMessages,
  selectAddServiceSuccess,
  selectUpdateServiceSuccess,
  selectDeleteServiceSuccess,
  clearAddSuccess,
  clearUpdateSuccess,
  clearDeleteSuccess
} from '../redux/ServiceSlice'

import {
  getAllChambres,
  deleteChambre,
  selectChambresList,
  selectChambreStatus,
  selectChambreErrors,
  selectChambreSuccessMessages,
  selectAddChambreSuccess,
  selectUpdateChambreSuccess,
  selectDeleteChambreSuccess,
  clearAddSuccess as clearAddChambreSuccess,
  clearUpdateSuccess as clearUpdateChambreSuccess,
  clearDeleteSuccess as clearDeleteChambreSuccess
} from '../redux/ChambreSlice'

// 1. Définition des vues disponibles
const VIEW_TYPES = {
  SERVICES: "Services",
  CHAMBRES: "Chambres",
}

// 2. Utilitaires
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('fr-FR')
  } catch (error) {
    return 'N/A'
  }
}

const getEntityId = (entity) => entity?._id || entity?.id

// 3. Composants de vue
const ServicesView = ({ onAdd, services, onDelete, isLoading }) => {
  const dispatch = useDispatch()

  const handleAction = useCallback((action, serviceId) => {
    if (!serviceId) {
      console.warn('ID de service manquant')
      return
    }

    console.log(`Action ${action} sur le service ${serviceId}`)

    switch (action) {
      case 'view':
        // Logique pour voir le service
        console.log('Voir le service:', serviceId)
        break
      case 'edit':
        // Logique pour modifier le service
        console.log('Modifier le service:', serviceId)
        break
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
          dispatch(deleteService(serviceId))
        }
        break
      default:
        console.warn('Action non reconnue:', action)
        break
    }
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="view-content">
        <div className="loading">Chargement des services...</div>
      </div>
    )
  }

  return (
    <div className="view-content">
      <div className='top'>
        <p>
          Tous les services
          <span>{services.length.toString().padStart(2, '0')}</span>
        </p>
        <button onClick={onAdd} type="button">
          <Plus />
          <span>Ajouter un service médical</span>
        </button>
      </div>
      <div className='bottom'>
        <div className='nav'>
          <ul>
            <section>
              <li>Nom service</li>
              <li>Nombres chambre</li>
              <li>Date d'ajout</li>
            </section>
            <li>Options</li>
          </ul>
        </div>
        <div className='data'>
          {services.length === 0 ? (
            <div className="no-data">
              <p>Aucun service disponible</p>
            </div>
          ) : (
            services.map((service) => {
              const serviceId = getEntityId(service)
              return (
                <div key={serviceId} className='info'>
                  <ul>
                    <section>
                      <li>
                        <Hospital />
                        <span>{service.nom || 'Nom non défini'}</span>
                      </li>
                      <li>{service.nombreChambres || 0}</li>
                      <li>{service.dateAjout || formatDate(service.createdAt)}</li>
                    </section>
                    <li>
                      <p>
                        <Eye
                          onClick={() => handleAction('view', serviceId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleAction('view', serviceId)}
                        />
                      </p>
                      <p>
                        <SquarePen
                          onClick={() => handleAction('edit', serviceId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleAction('edit', serviceId)}
                        />
                      </p>
                      <p>
                        <Trash
                          onClick={() => handleAction('delete', serviceId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleAction('delete', serviceId)}
                        />
                      </p>
                    </li>
                  </ul>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const ChambresView = ({ onAdd, chambres, services, onDelete, isLoading }) => {
  const dispatch = useDispatch()

  const handleAction = useCallback((action, chambreId) => {
    if (!chambreId) {
      console.warn('ID de chambre manquant')
      return
    }

    console.log(`Action ${action} sur la chambre ${chambreId}`)

    switch (action) {
      case 'edit':
        // Logique pour modifier la chambre
        console.log('Modifier la chambre:', chambreId)
        break
      case 'delete':
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette chambre ?')) {
          dispatch(deleteChambre(chambreId))
        }
        break
      default:
        console.warn('Action non reconnue:', action)
        break
    }
  }, [dispatch])

  // Fonction pour obtenir le nom du service à partir de son ID
  const getServiceName = useCallback((serviceId) => {
    if (!serviceId) return 'Service non défini'

    const service = services.find(s => getEntityId(s) === serviceId)
    return service ? service.nom : 'Service inconnu'
  }, [services])

  if (isLoading) {
    return (
      <div className="view-content">
        <div className="loading">Chargement des chambres...</div>
      </div>
    )
  }

  return (
    <div className="view-content">
      <div className='top'>
        <p>
          Toutes les chambres
          <span>{chambres.length.toString().padStart(2, '0')}</span>
        </p>
        <button onClick={onAdd} type="button">
          <Plus />
          <span>Ajouter une chambre</span>
        </button>
      </div>
      <div className='bottom'>
        <div className='nav'>
          <ul>
            <section>
              <li>Numéro chambre</li>
              <li>Service d'appartenance</li>
              <li>Date d'ajout</li>
            </section>
            <li>Options</li>
          </ul>
        </div>
        <div className='data'>
          {chambres.length === 0 ? (
            <div className="no-data">
              <p>Aucune chambre disponible</p>
            </div>
          ) : (
            chambres.map((chambre) => {
              const chambreId = getEntityId(chambre)
              return (
                <div key={chambreId} className='info'>
                  <ul>
                    <section>
                      <li>
                        <Bed />
                        <span>{chambre.numerochambre || chambre.numero || 'N/A'}</span>
                      </li>
                      <li>
                        <span>{getServiceName(chambre.serviceId) || chambre.service || 'Service non défini'}</span>
                      </li>
                      <li>{chambre.dateAjout || formatDate(chambre.createdAt)}</li>
                    </section>
                    <li>
                      <p>
                        <SquarePen
                          onClick={() => handleAction('edit', chambreId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleAction('edit', chambreId)}
                        />
                      </p>
                      <p>
                        <Trash
                          onClick={() => handleAction('delete', chambreId)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleAction('delete', chambreId)}
                        />
                      </p>
                    </li>
                  </ul>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// 4. Composant principal
export default function Chambre() {
  const dispatch = useDispatch()

  // États locaux
  const [viewMode, setViewMode] = useState(VIEW_TYPES.SERVICES)
  const [showNewServiceForm, setShowNewServiceForm] = useState(false)
  const [showNewChambreForm, setShowNewChambreForm] = useState(false)

  // Sélecteurs Redux pour les services
  const services = useSelector(selectServicesList) || []
  const serviceStatus = useSelector(selectServiceStatus)
  const serviceErrors = useSelector(selectServiceErrors)
  const serviceSuccessMessages = useSelector(selectServiceSuccessMessages)
  const addServiceSuccess = useSelector(selectAddServiceSuccess)
  const updateServiceSuccess = useSelector(selectUpdateServiceSuccess)
  const deleteServiceSuccess = useSelector(selectDeleteServiceSuccess)

  // Sélecteurs Redux pour les chambres
  const chambres = useSelector(selectChambresList) || []
  const chambreStatus = useSelector(selectChambreStatus)
  const chambreErrors = useSelector(selectChambreErrors)
  const chambreSuccessMessages = useSelector(selectChambreSuccessMessages)
  const addChambreSuccess = useSelector(selectAddChambreSuccess)
  const updateChambreSuccess = useSelector(selectUpdateChambreSuccess)
  const deleteChambreSuccess = useSelector(selectDeleteChambreSuccess)

  // Calcul des services avec le nombre de chambres
  const servicesWithChambreCount = useMemo(() => {
    if (!Array.isArray(services) || !Array.isArray(chambres)) {
      return []
    }

    return services.map(service => {
      const serviceId = getEntityId(service)
      const nombreChambres = chambres.filter(chambre => {
        const chambreServiceId = chambre.serviceId
        return chambreServiceId === serviceId
      }).length

      return {
        ...service,
        nombreChambres
      }
    })
  }, [services, chambres])

  // Chargement initial des données
  useEffect(() => {
    dispatch(getAllServices())
    dispatch(getAllChambres())
  }, [dispatch])

  // Gestion silencieuse des opérations réussies pour les services
  useEffect(() => {
    if (addServiceSuccess) {
      setShowNewServiceForm(false)
      dispatch(getAllServices())
      dispatch(getAllChambres()) // Rafraîchir aussi les chambres pour le count
      dispatch(clearAddSuccess())
    }
  }, [addServiceSuccess, dispatch])

  useEffect(() => {
    if (updateServiceSuccess) {
      dispatch(getAllServices())
      dispatch(getAllChambres()) // Rafraîchir aussi les chambres pour le count
      dispatch(clearUpdateSuccess())
    }
  }, [updateServiceSuccess, dispatch])

  useEffect(() => {
    if (deleteServiceSuccess) {
      dispatch(getAllServices())
      dispatch(getAllChambres()) // Rafraîchir aussi les chambres pour le count
      dispatch(clearDeleteSuccess())
    }
  }, [deleteServiceSuccess, dispatch])

  // Gestion silencieuse des opérations réussies pour les chambres
  useEffect(() => {
    if (addChambreSuccess) {
      setShowNewChambreForm(false)
      dispatch(getAllChambres())
      dispatch(getAllServices()) // Rafraîchir aussi les services pour le count
      dispatch(clearAddChambreSuccess())
    }
  }, [addChambreSuccess, dispatch])

  useEffect(() => {
    if (updateChambreSuccess) {
      dispatch(getAllChambres())
      dispatch(getAllServices()) // Rafraîchir aussi les services pour le count
      dispatch(clearUpdateChambreSuccess())
    }
  }, [updateChambreSuccess, dispatch])

  useEffect(() => {
    if (deleteChambreSuccess) {
      dispatch(getAllChambres())
      dispatch(getAllServices()) // Rafraîchir aussi les services pour le count
      dispatch(clearDeleteChambreSuccess())
    }
  }, [deleteChambreSuccess, dispatch])

  // Gestionnaires d'événements optimisés
  const handleViewChange = useCallback((newView) => {
    if (Object.values(VIEW_TYPES).includes(newView)) {
      setViewMode(newView)
    }
  }, [])

  const handleAddService = useCallback(() => {
    setShowNewServiceForm(true)
  }, [])

  const handleAddChambre = useCallback(() => {
    setShowNewChambreForm(true)
  }, [])

  const handleCloseServiceForm = useCallback(() => {
    setShowNewServiceForm(false)
  }, [])

  const handleCloseChambreForm = useCallback(() => {
    setShowNewChambreForm(false)
  }, [])

  // Rendu du sélecteur d'onglets
  const renderViewSelector = useCallback(() => {
    const views = [
      { type: VIEW_TYPES.SERVICES, label: "Services", icon: <Hospital /> },
      { type: VIEW_TYPES.CHAMBRES, label: "Chambres", icon: <BedSingle /> },
    ]

    return (
      <ul className="view-selector">
        {views.map(({ type, label, icon }) => (
          <li
            key={type}
            className={viewMode === type ? "active" : ""}
            onClick={() => handleViewChange(type)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleViewChange(type)}
          >
            <span>{icon}</span>
            {label}
          </li>
        ))}
      </ul>
    )
  }, [viewMode, handleViewChange])

  // Affichage du composant correspondant
  const renderViewComponent = useCallback(() => {
    const isServiceLoading = serviceStatus === 'loading'
    const isChambreLoading = chambreStatus === 'loading'

    switch (viewMode) {
      case VIEW_TYPES.SERVICES:
        return (
          <ServicesView
            onAdd={handleAddService}
            services={servicesWithChambreCount}
            onDelete={deleteService}
            isLoading={isServiceLoading}
          />
        )
      case VIEW_TYPES.CHAMBRES:
        return (
          <ChambresView
            onAdd={handleAddChambre}
            chambres={chambres}
            services={services}
            onDelete={deleteChambre}
            isLoading={isChambreLoading}
          />
        )
      default:
        return (
          <div className="view-content">
            <div className="error-message">Vue non reconnue</div>
          </div>
        )
    }
  }, [viewMode, servicesWithChambreCount, chambres, services, serviceStatus, chambreStatus, handleAddService, handleAddChambre])

  // Affichage des messages d'erreur uniquement
  const renderErrorMessages = useCallback(() => {
    const errors = []

    if (serviceErrors && typeof serviceErrors === 'object') {
      Object.values(serviceErrors).forEach(error => {
        if (error && typeof error === 'string') {
          errors.push(error)
        }
      })
    }

    if (chambreErrors && typeof chambreErrors === 'object') {
      Object.values(chambreErrors).forEach(error => {
        if (error && typeof error === 'string') {
          errors.push(error)
        }
      })
    }

    if (errors.length === 0) return null

    return (
      <div className="error-messages">
        {errors.map((error, index) => (
          <div key={index} className="error-message">
            {error}
          </div>
        ))}
      </div>
    )
  }, [serviceErrors, chambreErrors])

  return (
    <>
      {/* Messages d'erreur uniquement */}
      {renderErrorMessages()}

      <div className='gestion-option-container'>
        <div className='entete'>
          <Blocks size={30} />
          <p>Gestion des services et chambres</p>
        </div>

        <div className='body'>
          <div className='navigation'>
            {renderViewSelector()}
          </div>
          <div className='container-data'>
            {renderViewComponent()}
          </div>
        </div>
      </div>

      {/* Formulaire pour ajouter un service */}
      {showNewServiceForm && (
        <NewService onClose={handleCloseServiceForm} />
      )}

      {/* Formulaire pour ajouter une chambre */}
      {showNewChambreForm && (
        <NewChambre onClose={handleCloseChambreForm} />
      )}
    </>
  )
}