import {StOptionItem} from '@/components/CommonUI/OptionUI/enum'
import {NButton} from 'naive-ui'
import {useKeeStore} from '@/store/kee-store'
import {showInputPrompt} from '@/components/CommonUI/input-prompt'

export const useKdbxOptions = () => {
  const keeStore = useKeeStore()

  const kdbxConfigOption = computed((): StOptionItem => {
    if (!keeStore.dbInfo) {
      return {
        label: 'Kdbx Config',
        key: 'kdbx',
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
              disabled: true,
              onClick: async () => {
                const password = await showInputPrompt({
                  title: '1. Input New Password',
                  placeholder: '',
                  value: '',
                  type: 'password',
                })
                const password2 = await showInputPrompt({
                  title: '2. Confirm New Password',
                  placeholder: '',
                  value: '',
                  type: 'password',
                  validateFn: (value) => {
                    if (value !== password) {
                      return 'password not match'
                    }
                  },
                })
                // if (password) {
                //   keeStore.changeDbPassword(password)
                // }
              },
            },
            {
              default: () => 'Change',
            }
          ),
        },
      ],
    }
  })

  return {
    kdbxConfigOption,
  }
}
