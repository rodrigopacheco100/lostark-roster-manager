interface FileSystemHandlePermissionDescriptor {
  mode: "read" | "readwrite"
}

type PermissionState = "granted" | "denied" | "prompt"

interface FileSystemHandle {
  name: string
  queryPermission(descriptor: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
  requestPermission(descriptor: FileSystemHandlePermissionDescriptor): Promise<PermissionState>
}

interface FileSystemFileHandle extends FileSystemHandle {
  getFile(): Promise<File>
}

interface OpenFilePickerOptions {
  types?: {
    description: string
    accept: Record<string, string[]>
  }[]
  multiple?: boolean
}

interface Window {
  showOpenFilePicker(options?: OpenFilePickerOptions): Promise<FileSystemFileHandle[]>
}
