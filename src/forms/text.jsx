<>
<div className='containers-params-add'>
    <div className='section-new-patient center'>
        <p className='pp'>
            <ClipboardList size={30} />
            <span>Formulaire d'ajout d'un Medecin</span>
        </p>
    </div>
    <form action='#'>
        <div className='information personnel'>
            <div className='part-description'>
                <h3>
                    <CircleUserRound />
                    <span>Information Personnel</span>
                </h3>
                <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Quasi, quisquam distinctio exercitationem nihil asperiores ea?
                    Molestias harum repellendus praesentium exercitationem.
                </p>
            </div>
            <div className='part-form'>
                <section>
                    <div className='info'>
                        <label for=''>Nom Medecin</label>
                        <input type='text' />
                    </div>
                    <div className='info'>
                        <label for=''>Prenom Medecin</label>
                        <input type='text' />
                    </div>
                    <div className='info'>
                        <label for=''>Date de Naissance</label>
                        <input type='date' />
                    </div>
                    <div className='info'>
                        <label for=''>Lieux de Naissance</label>
                        <input type='text' />
                    </div>
                    <div className='info'>
                        <label for=''>Telephone</label>
                        <input type='tel' />
                    </div>
                    <div className='info'>
                        <label for=''>Ville</label>
                        <input type='text' />
                    </div>
                    <div className='info'>
                        <label for=''>Domicile</label>
                        <input type='text' />
                    </div>
                </section>
            </div>
        </div>
        <div className='information medicale'>
            <div className='part-description'>
                <h3>
                    <UserCog />
                    <span>Information Médicale</span>
                </h3>
                <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Quasi, quisquam distinctio exercitationem nihil asperiores ea?
                    Molestias harum repellendus praesentium exercitationem.
                </p>
            </div>
            <div className='part-form'>
                <section>
                    <div className='info'>
                        <label for=''>Service Medicale</label>
                        <input type='text' />
                    </div>
                    <div className='info'>
                        <label for=''>Poste au sein de l'hopital</label>
                        <input type='text' />
                    </div>
                </section>
            </div>
        </div>
        <div className='information sécurite'>
            <div className='part-description'>
                <h3>
                    <ShieldUser />
                    <span>Information de sécurité</span>
                </h3>
                <p>
                    Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                    Quasi, quisquam distinctio exercitationem nihil asperiores ea?
                    Molestias harum repellendus praesentium exercitationem.
                </p>
            </div>
            <div className='part-form'>
                <div className='info'>
                    <label for=''>Email</label>
                    <input type='email' placeholder='enter your email' />
                </div>
                <div className='info'>
                    <label for=''>Mot de passe</label>
                    <input type='password' placeholder='enter your password' />
                </div>
            </div>
        </div>
        <div className='btns'>
            <button className='cancel' onClick={() => aff(false)}>
                Annuler
            </button>
            <button>Confirmer</button>
        </div>
    </form>
</div>
</>