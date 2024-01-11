import {StOptionItem} from '@/components/CommonUI/OptionUI/enum'
import {NButton, NSpace} from 'naive-ui'
import {useKeeStore} from '@/store/kee-store'
import {showInputPrompt} from '@/components/CommonUI/input-prompt'
import {changeCredentials, createCredentialKey, electronOpenSaveDialog} from '@/api/keepass'
import globalEventBus, {GlobalEvents} from '@/utils/bus'
import {isElectron} from '@/utils/backend'
import {kService} from '@/api'

export const useKdbxOptions = (mVisible) => {
  const keeStore = useKeeStore()

  const kdbxConfigOption = computed((): StOptionItem => {
    if (!keeStore.dbInfo) {
      return {
        label: 'Kdbx Config',
        key: 'kdbx',
        hidden: true,
      }
    }

    return {
      label: 'Kdbx Config',
      key: 'kdbx',
      children: [
        {
          label: 'Database Info',
          key: 'info',
          actionRender: h(
            NButton,
            {
              type: 'primary',
              size: 'small',
              onClick: async () => {
                window.$dialog.info({
                  title: 'Database Info',
                  content: () =>
                    h('textarea', {
                      cols: 46,
                      rows: 20,
                      class: 'font-code',
                      readonly: true,
                      value: JSON.stringify(keeStore.dbInfo, null, 2),
                    }),
                })
              },
            },
            {
              default: () => 'View',
            }
          ),
        },
        {
          label: 'Database Password',
          key: 'change_password',
          actionRender: h(
            NButton,
            {
              type: 'primary',
              size: 'small',
              onClick: async () => {
                const password = await showInputPrompt({
                  title: '1. Input new database password',
                  placeholder: '',
                  value: '',
                  type: 'password',
                })
                const password2 = await showInputPrompt({
                  title: '2. Confirm new password',
                  placeholder: '',
                  value: '',
                  type: 'password',
                  validateFn: (value) => {
                    if (value !== password) {
                      return 'password not match'
                    }
                  },
                })
                if (password2) {
                  await changeCredentials({password: password2})
                  window.$message.success('Database password changed!')
                  globalEventBus.emit(GlobalEvents.CLOSE_DATABASE)
                  mVisible.value = false
                }
              },
            },
            {
              default: () => 'Change',
            }
          ),
        },
        isElectron
          ? {
              label: 'Database Key',
              key: 'change_key',
              actionRender: h(
                NSpace,
                {size: 'small'},
                {
                  default: () => [
                    h(
                      NButton,
                      {
                        size: 'small',
                        onClick: async () => {
                          const {filePath} = await kService.electronOpenSaveDialog({
                            defaultPath: 'new.key',
                            filters: [
                              {
                                name: 'Key File',
                                extensions: ['key'],
                              },
                            ],
                          })
                          await createCredentialKey({keyPath: filePath})
                          window.$message.success('Key file created: ' + filePath)
                        },
                      },
                      {
                        default: () => 'Create',
                      }
                    ),
                    h(
                      NButton,
                      {
                        type: 'primary',
                        size: 'small',
                        onClick: async () => {
                          const {filePaths} = await kService.electronOpenFileDialog({
                            filters: [
                              {
                                name: 'Key File',
                                extensions: ['*'],
                              },
                            ],
                          })
                          if (filePaths && filePaths.length > 0) {
                            const keyPath = filePaths[0]
                            console.log(keyPath)

                            window.$dialog.warning({
                              title: 'Confirm change database key?',
                              content: keyPath,
                              positiveText: 'OK',
                              negativeText: 'Cancel',
                              onPositiveClick: async () => {
                                await changeCredentials({keyPath})
                                window.$message.success('Database key changed!')
                                globalEventBus.emit(GlobalEvents.CLOSE_DATABASE)
                                mVisible.value = false
                              },
                              onNegativeClick: () => {},
                            })
                          }
                        },
                      },
                      {
                        default: () => 'Change',
                      }
                    ),
                  ],
                }
              ),
            }
          : null,
      ].filter(Boolean),
    }
  })

  return {
    kdbxConfigOption,
  }
}
