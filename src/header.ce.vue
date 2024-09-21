<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { getUserDetails, getPlatformInfos } from './auth'
import type { User, PlatformInfos } from './auth'
import HamburgerIcon from './ui/HamburgerIcon.vue'
import CloseIcon from './ui/CloseIcon.vue'
import ProfileIcon from './ui/ProfileIcon.vue'
import AccountIcon from './ui/AccountIcon.vue'
import BrandLogo from './ui/BrandLogo.vue'
import SearchIcon from '@/ui/SearchIcon.vue'
import MapIcon from '@/ui/MapIcon.vue'
import DashboardIcon from '@/ui/DashboardIcon.vue'
import AnalyticsIcon from '@/ui/AnalyticsIcon.vue'
import ExitIcon from '@/ui/ExitIcon.vue'
import UsersIcon from '@/ui/UsersIcon.vue'
import ExtensionIcon from '@/ui/ExtensionIcon.vue'
import ServiceIcon from '@/ui/ServiceIcon.vue'
import ChevronDownIcon from '@/ui/ChevronDownIcon.vue'
import { LANG_2_TO_3_MAPPER, t } from '@/i18n'

const props = defineProps<{
  hideLogin?: string
  lang?: string
  activeApp?: string
  logoUrl?: string
  //legacy option : using old iframe option
  legacyHeader?: string
  legacyUrl?: string
  style?: string
  stylesheet?: string
}>()

const state = reactive({
  user: null as null | User,
  mobileMenuOpen: false,
  lang3: props.lang,
  platformInfos: null as null | PlatformInfos,
  darkMode: false, // Add dark mode state
})

const isAnonymous = computed(() => !state.user || state.user.anonymous)
const isAdmin = computed(() => state.user?.adminRoles?.admin)
const isWarned = computed(() => state.user?.warned)
const remainingDays = computed(() => state.user?.remainingDays)
const adminRoles = computed(() => state.user?.adminRoles)

const loginUrl = computed(() => {
  const current = new URL(window.location.href)
  current.searchParams.set('login', '')
  return current.toString()
})
const logoutUrl = computed(() => '/logout')

const themeClass = computed(() => (state.darkMode ? 'dark' : 'light')) // Add theme class

function toggleMenu(): void {
  state.mobileMenuOpen = !state.mobileMenuOpen
}

function toggleDarkMode(): void {
  state.darkMode = !state.darkMode
}

onMounted(() => {
  state.lang3 =
    LANG_2_TO_3_MAPPER[props.lang || navigator.language.substring(0, 2)] ||
    'eng'
  getUserDetails().then(user => {
    state.user = user
    if (user?.adminRoles?.admin) {
      getPlatformInfos().then(
        platformInfos => (state.platformInfos = platformInfos)
      )
    }
  })
})
</script>
<template>
  <div v-if="props.legacyHeader === 'true'">
    <iframe class="w-full" v-bind:src="`${props.legacyUrl}${props.activeApp ? `?active=${props.activeApp}` : ''
      }`" v-bind:style="props.style"></iframe>
  </div>
  <header v-else class="font-sans h-[72px] text-base color-current dark:text-slate-100" v-bind:style="props.style">
    <link rel="stylesheet" :href="props.stylesheet" v-if="props.stylesheet" />
    <component :is="'style'" v-if="!props.stylesheet">
      @media (prefers-color-scheme: light) {
      header {
      --geovision-header-primary: rgb(79, 70, 229);
      --geovision-header-secondary: #1b1f3b;
      --geovision-header-primary-light: #1244F01a;
      --geovision-header-secondary-light: #1b1f3b1a;
      }
      }
      @media (prefers-color-scheme: dark) {
      header {
      --geovision-header-primary: rgb(99, 102, 241);
      --geovision-header-secondary: unset;
      --geovision-header-primary-light: #4338ca1a;
      --geovision-header-secondary-light: unset;
      }
      }
    </component>
    <div class="flex items-center w-full h-full bg-neutral-100 dark:bg-neutral-900 text-current dark:text-slate-100">
      <div class="flex mx-auto px-6 py-4 w-full lg:w-9/12 md:w-11/12 transition-all sm:flex hidden justify-between">
        <div class="flex justify-start items-center space-x-8">
          <a target="_parent" href="/" class="flex justify-start items-center w-32">
            <img v-if="props.logoUrl" :src="props.logoUrl" alt="Logo" class="w-full h-full" />
            <BrandLogo v-else class="w-full h-full"></BrandLogo>
          </a>
          <nav class="flex justify-start items-center space-x-3" role="tablist">
            <a target="_parent" class="nav-item" :class="{ active: props.activeApp === 'datahub' }" href="/datahub/"
              role="tab">
              {{ t('catalogue') }}
            </a>
            <a target="_parent" class="nav-item" :class="{ active: props.activeApp === 'mapstore' }" href="/mapstore/"
              role="tab">
              {{ t('maps') }}
            </a>
            <a target="_parent" class="nav-item" :class="{ active: props.activeApp === 'mapstore-home' }"
              href="/mapstore/#/home" role="tab">
              {{ t('apps') }}
            </a>
            <a target="_parent" class="nav-item" :class="{ active: props.activeApp === 'geoserver' }"
              href="/geoserver/web/" role="tab">
              {{ t('services') }}
            </a>
            <span class="text-gray-400 text-xs" v-if="isWarned">
              <a target="_parent" href="/console/account/changePassword">
                {{ t('remaining_days_msg_part1') }} {{ remainingDays }}
                {{ t('remaining_days_msg_part2') }}
                {{ t('remaining_days_msg_part3') }}</a></span>
          </nav>
        </div>
        <div class="flex justify-center items-center items-center">
          <a target="_parent" class="btn" :class="{ active: props.activeApp === 'import' }" href="/import/"
            v-if="adminRoles?.import">
            {{ t('datafeeder') }}
          </a>
          <div v-if="!isAnonymous" class="admin group relative inline-block">
            <button class="nav-item flex items-center gap-4"
              :title="`${state.user?.firstname} ${state.user?.lastname}`">
              <AccountIcon class="text-basic inline-block"></AccountIcon>
              <span class="max-w-[120px] truncate text-left">
                <div class="font-medium text-sm opacity-100">
                  {{ `${state.user?.firstname} ${state.user?.lastname}` }}
                </div>
                <div class="font-light text-xs opacity-90">
                  {{ `${state.user?.organization}` }}
                </div>
              </span>
            </button>
            <ul
              class="absolute hidden group-hover:block border w-full admin-dropdown z-[1002] bg-neutral-20 dark:bg-neutral-800">
              <!--
              <li :class="{ active: props.activeApp === 'geonetwork' }">
                <a target="_parent" class="catalog" v-if="adminRoles?.catalog || adminRoles?.catalogAdmin" :href="adminRoles?.catalogAdmin
                  ? `/geonetwork/srv/${state.lang3}/admin.console`
                  : `/geonetwork/srv/${state.lang3}/catalog.edit#/board`
                  ">
                  <SearchIcon class="icon-dropdown"></SearchIcon>
                  <span class="first-letter:capitalize">{{ t('catalogue') }}</span>
                </a>
              </li>
                <li :class="{ active: props.activeApp === 'msadmin' }">
                  <a target="_parent" href="/mapstore/#/admin" v-if="adminRoles?.viewer" class="">
                    <MapIcon class="icon-dropdown"></MapIcon>
                    <span class="first-letter:capitalize">{{ t('maps') }}</span>
                  </a>
                </li>
              -->
              <li>
                <a target="_parent" href="/console/account/userdetails" class="profile">
                  <ProfileIcon class="icon-dropdown"></ProfileIcon>
                  <span class="first-letter:capitalize">{{ t('profile') }}</span>
                </a>
              </li>
              <li :class="{ active: props.activeApp === 'console' }">
                <a target="_parent" href="/console/manager/home" v-if="adminRoles?.console" :v-if="isAdmin"
                  class="console">
                  <DashboardIcon class="icon-dropdown"></DashboardIcon>
                  <span class="first-letter:capitalize">{{ t('console') }}</span>
                </a>
              </li>
              <li :class="{ active: props.activeApp === 'analytics' }" v-if="state.platformInfos?.analyticsEnabled"
                :v-if="isAdmin">
                <a target="_parent" href="/analytics/" class="analytics">
                  <AnalyticsIcon class="icon-dropdown"></AnalyticsIcon>
                  <span class="first-letter:capitalize">{{ t('analytics') }}</span>
                </a>
              </li>
              <li>
                <a target="_parent" :href="logoutUrl">
                  <ExitIcon class="icon-dropdown"></ExitIcon>
                  <span class="first-letter:capitalize">{{ t('logout') }}</span>
                </a>
              </li>

            </ul>
          </div>
          <a target="_parent" v-if="props.hideLogin !== 'true' && isAnonymous" class="btn" :href="loginUrl">
            {{ t('login') }}
          </a>
        </div>
      </div>
      <div class="flex-col sm:hidden w-full">
        <div
          class="h-full inline-flex items-center justify-start align-middle px-2 py-2 shrink-0 w-full bg-neutral-100 dark:bg-neutral-900">
          <div class="grow flex justify-start items-center">
            <span class="inline-flex items-center gap-2">
              <!--
                <button type="button" @click="toggleMenu">
                  <CloseIcon v-if="state.mobileMenuOpen" ></CloseIcon>
                  <HamburgerIcon v-else ></HamburgerIcon>
                </button>
                -->
              <a target="_parent" href="/" class="flex justify-start items-center w-32">
                <img v-if="props.logoUrl" :src="props.logoUrl" alt="Logo" class="w-full h-full" />
                <BrandLogo v-else class="w-full h-full"></BrandLogo>
              </a>
            </span>
          </div>
          <div class="flex justify-center items-center">
            <a target="_parent" class="btn" href="/import/" v-if="!isAnonymous">
              <span>{{ t('datafeeder') }}</span>
            </a>
            <div v-if="!isAnonymous" class="admin group relative inline-block">
              <button class="nav-item flex items-center gap-4"
                :title="`${state.user?.firstname} ${state.user?.lastname}`">
                <AccountIcon class="font-bold text-2xl inline-block"></AccountIcon>
                <span class="max-w-[94px] truncate text-left">
                  <div class="font-medium text-sm opacity-100">
                    {{ `${state.user?.firstname} ${state.user?.lastname}` }}
                  </div>
                  <div class="font-light text-xs opacity-90">
                    {{ `${state.user?.organization}` }}
                  </div>
                </span>
              </button>
              <ul
                class="absolute hidden group-hover:block border w-full admin-dropdown z-[1002] bg-slate-50 dark:bg-gray-700">
                <!--
              <li :class="{ active: props.activeApp === 'geonetwork' }">
                <a target="_parent" class="catalog" v-if="adminRoles?.catalog || adminRoles?.catalogAdmin" :href="adminRoles?.catalogAdmin
                  ? `/geonetwork/srv/${state.lang3}/admin.console`
                  : `/geonetwork/srv/${state.lang3}/catalog.edit#/board`
                  ">
                  <SearchIcon class="icon-dropdown"></SearchIcon>
                  <span class="first-letter:capitalize">{{ t('catalogue') }}</span>
                </a>
              </li>
                <li :class="{ active: props.activeApp === 'msadmin' }">
                  <a target="_parent" href="/mapstore/#/admin" v-if="adminRoles?.viewer" class="">
                    <MapIcon class="icon-dropdown"></MapIcon>
                    <span class="first-letter:capitalize">{{ t('maps') }}</span>
                  </a>
                </li>
              -->
                <li>
                  <a target="_parent" href="/console/account/userdetails" class="profile">
                    <ProfileIcon class="icon-dropdown"></ProfileIcon>
                    <span class="first-letter:capitalize">{{ t('profile') }}</span>
                  </a>
                </li>
                <li :class="{ active: props.activeApp === 'console' }" v-if="adminRoles?.console" :v-if="isAdmin">
                  <a target="_parent" href="/console/manager/home" class="console">
                    <DashboardIcon class="icon-dropdown"></DashboardIcon>
                    <span class="first-letter:capitalize">{{ t('console') }}</span>
                  </a>
                </li>
                <li :class="{ active: props.activeApp === 'analytics' }" v-if="state.platformInfos?.analyticsEnabled"
                  :v-if="isAdmin">
                  <a target="_parent" href="/analytics/" class="analytics">
                    <AnalyticsIcon class="icon-dropdown"></AnalyticsIcon>
                    <span class="first-letter:capitalize">{{ t('analytics') }}</span>
                  </a>
                </li>
                <li>
                  <a target="_parent" :href="logoutUrl">
                    <ExitIcon class="icon-dropdown"></ExitIcon>
                    <span class="first-letter:capitalize">{{ t('logout') }}</span>
                  </a>
                </li>
              </ul>
            </div>
            <a target="_parent" v-else class="btn" :href="loginUrl">{{ t('login') }}</a>
          </div>
        </div>

        <div
          class="fixed z-[1000] mobile-menu bottom-0 top-auto bg-neutral-100 dark:bg-neutral-800 w-full duration-300 transition-opacity ease-in-out">
          <nav class="flex flex-row justify-between" role="tablist">
            <a target="_parent" class="nav-item-mobile" :class="{ active: props.activeApp === 'datahub' }"
              href="/datahub/" role="tab">
              <SearchIcon></SearchIcon>
              <span>{{ t('catalogue') }}</span>
            </a>
            <a target="_parent" class="nav-item-mobile" :class="{ active: props.activeApp === 'mapstore' }"
              href="/mapstore/" role="tab">
              <MapIcon></MapIcon>
              <span>{{ t('maps') }}</span>
            </a>
            <a target="_parent" class="nav-item-mobile" :class="{ active: props.activeApp === 'mapstore-home' }"
              href="/mapstore/#/home" role="tab">
              <ExtensionIcon></ExtensionIcon>
              <span>{{ t('apps') }}</span>
            </a>
            <a target="_parent" class="nav-item-mobile" :class="{ active: props.activeApp === 'geoserver' }"
              href="/geoserver/" role="tab">
              <ServiceIcon></ServiceIcon>
              <span>{{ t('services') }}</span>
            </a>
          </nav>
        </div>
      </div>
    </div>
  </header>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .nav-item-mobile {
    @apply text-base flex flex-col gap-1 items-center text-center py-3 w-full first-letter:capitalize;
  }

  .nav-item-mobile.active>span {
    @apply font-bold text-primary dark:text-primary;
  }

  .nav-item-mobile.active>svg {
    @apply bg-primary-light dark:bg-primary-light rounded-full dark:text-primary;
  }

  .nav-item {
    @apply inline-block px-4 py-2 border-b-2 border-b-transparent rounded-t-lg w-fit hover:text-gray-600 dark:hover:text-gray-300 first-letter:capitalize;
  }

  .nav-item.active {
    @apply font-bold border-indigo-600 dark:border-indigo-500 text-indigo-600 hover:text-indigo-600 dark:text-indigo-500 dark:hover:text-indigo-500;
  }

  .btn {
    @apply uppercase text-base font-semibold whitespace-nowrap px-4 py-2 mx-2 text-slate-100 bg-primary hover:brightness-90 transition-colors;
  }

  .btn-secondary {
    @apply uppercase text-base font-semibold whitespace-nowrap px-4 py-2 mx-2 text-primary bg-transparent border hover:bg-primary hover:brightness-90 hover:text-slate-100 transition-colors;
  }

  .link-btn {
    @apply text-primary hover:text-slate-700 hover:underline underline-offset-8 decoration-2 decoration-slate-700 dark:text-slate-100 dark:hover:text-gray-300 flex flex-row items-center;
  }

  .admin-dropdown>li {
    @apply block px-2 text-left hover:bg-indigo-700/10 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-slate-100 capitalize;
  }

  .admin-dropdown>li>a {
    @apply flex items-center gap-2 w-full h-full py-3;
  }

  .admin-dropdown>li.active {
    @apply bg-indigo-700/20;
  }

  .icon-dropdown {
    @apply w-4 h-4 inline-block align-text-top;
  }

  * {
    -webkit-tap-highlight-color: transparent;
  }
}
</style>
