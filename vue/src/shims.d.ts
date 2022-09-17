import {MessageApiInjection} from 'naive-ui/es/message/src/MessageProvider'
import {DialogApiInjection} from 'naive-ui/es/dialog/src/DialogProvider'
import {NotificationApiInjection} from 'naive-ui/es/notification/src/NotificationProvider'

declare global {
  interface Window {
    $message: MessageApiInjection
    $notification: NotificationApiInjection
    $dialog: DialogApiInjection
  }
}

declare module 'axios' {
  export interface AxiosResponse<T = any> extends Promise<T> {}
}
