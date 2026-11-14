/* ========================================================================= */
/* ÖG AUTH SERVICE - Autenticación, Sesión y Perfiles de Usuario             */
/* ========================================================================= */

import { db } from './supabase.js';
import { appState } from '../core/state.js';

export async function initAuthSession(onSessionLoaded) {
  const { data } = await db.auth.getSession();
  if (data.session?.user) {
    await loadAccount(data.session.user, onSessionLoaded);
  } else {
    showAuthOverlay();
  }
}

export async function executeSignUp(email, password, username, statusCallback) {
  if (!email || !password || !username) {
    return statusCallback('Completá todos los campos.');
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return statusCallback('Usuario: 3 a 20 caracteres alfanuméricos.');
  }
  if (password.length < 8) {
    return statusCallback('Contraseña mínima de 8 caracteres.');
  }

  statusCallback('Creando cuenta...');

  const { data, error } = await db.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });

  if (error) return statusCallback(error.message);

  if (data.session) {
    await loadAccount(data.session.user);
    hideAuthOverlay();
  } else {
    statusCallback('¡Cuenta creada! Ya podés iniciar sesión.');
    setTimeout(() => switchAuthSubView('signin'), 1500);
  }
}

export async function executeSignIn(email, password, statusCallback) {
  if (!email || !password) {
    return statusCallback('Ingresá correo y contraseña.');
  }

  statusCallback('Iniciando sesión...');

  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) return statusCallback(error.message);

  await loadAccount(data.user);
  hideAuthOverlay();
}

export async function executeConfirmedSignOut(cleanupChannelsCallback) {
  if (cleanupChannelsCallback) cleanupChannelsCallback();

  const { error } = await db.auth.signOut();
  if (error) {
    alert(error.message);
    return;
  }

  appState.currentUser = null;
  appState.myProfile = null;
  appState.viewedProfile = null;
  appState.myActiveStories = [];
  appState.storiesByUserMap = {};
  appState.storyUserOrder = [];
  appState.cachedConversationsList = null;
  appState.cachedActivityEvents = null;
  appState.cachedFeedPosts = null;
  appState.loadedPostIds.clear();
  appState.seenNotificationKeys.clear();

  showAuthOverlay();
}

async function loadAccount(user, callback) {
  appState.currentUser = user;
  appState.seenNotificationKeys.clear();

  let { data: profile, error } = await db.from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error al consultar perfil:', error.message);
    return;
  }

  if (!profile) {
    const username = user.user_metadata?.username || ('usuario_' + user.id.slice(0, 8));
    const { data: created, error: createError } = await db.from('profiles')
      .insert({ id: user.id, username, display_name: username })
      .select()
      .single();

    if (createError) {
      console.error('No se pudo crear perfil:', createError.message);
      return;
    }
    profile = created;
  }

  appState.myProfile = profile;
  appState.profilesCache[user.id] = profile;
  hideAuthOverlay();

  if (callback) callback(user);
}

function showAuthOverlay() {
  const overlay = document.getElementById('authWelcomeOverlay');
  if (overlay) overlay.classList.add('visible');
}

function hideAuthOverlay() {
  const overlay = document.getElementById('authWelcomeOverlay');
  if (overlay) overlay.classList.remove('visible');
}

function switchAuthSubView(viewName) {
  const welcome = document.getElementById('authWelcomePanel');
  const signup = document.getElementById('authSignupPanel');
  const signin = document.getElementById('authSigninPanel');
  const statusEl = document.getElementById('authOverlayStatus');

  if (welcome) welcome.classList.remove('active');
  if (signup) signup.classList.remove('active');
  if (signin) signin.classList.remove('active');
  if (statusEl) statusEl.textContent = '';

  if (viewName === 'welcome' && welcome) welcome.classList.add('active');
  if (viewName === 'signup' && signup) signup.classList.add('active');
  if (viewName === 'signin' && signin) signin.classList.add('active');
}
