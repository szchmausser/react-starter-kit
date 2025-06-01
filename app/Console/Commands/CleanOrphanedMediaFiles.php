<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class CleanOrphanedMediaFiles extends Command
{
    /**
     * El nombre y la firma del comando.
     *
     * @var string
     */
    protected $signature = 'media:clean-orphaned 
                            {--disk=public : El disco de almacenamiento a revisar}
                            {--dry-run : Ejecutar en modo simulación sin eliminar archivos}';

    /**
     * La descripción del comando.
     *
     * @var string
     */
    protected $description = 'Limpia archivos huérfanos que no están registrados en la base de datos';

    /**
     * Ejecuta el comando.
     *
     * @return int
     */
    public function handle()
    {
        $diskName = $this->option('disk');
        $isDryRun = $this->option('dry-run');
        $isVerbose = $this->getOutput()->isVerbose();
        $mediaDirectory = 'media';
        $orphanedFiles = 0;
        $totalFiles = 0;
        $errors = 0;

        $this->info("Iniciando limpieza de archivos huérfanos en el disco '{$diskName}'...");
        if ($isDryRun) {
            $this->warn('Ejecutando en modo simulación. No se eliminarán archivos.');
        }

        try {
            // Verificar si el directorio media existe
            if (!Storage::disk($diskName)->exists($mediaDirectory)) {
                $this->error("El directorio '{$mediaDirectory}' no existe en el disco '{$diskName}'.");
                return Command::FAILURE;
            }

            // Obtener todas las colecciones conocidas
            $knownCollections = Media::select('collection_name')->distinct()->pluck('collection_name')->toArray();

            // Añadir colecciones predefinidas que podrían no estar en la base de datos aún
            $predefinedCollections = ['documents', 'images', 'videos', 'audio', 'spreadsheets', 'presentations', 'compressed'];
            $allCollections = array_unique(array_merge($knownCollections, $predefinedCollections));

            if ($isVerbose) {
                $this->info('Colecciones a revisar: ' . implode(', ', $allCollections));
            }

            // Revisar cada colección
            foreach ($allCollections as $collection) {
                $directoryPath = $mediaDirectory . '/' . $collection;

                if ($isVerbose) {
                    $this->line("Revisando directorio: {$directoryPath}");
                }

                if (!Storage::disk($diskName)->exists($directoryPath)) {
                    if ($isVerbose) {
                        $this->line("El directorio {$directoryPath} no existe. Omitiendo...");
                    }
                    continue;
                }

                // Obtener todos los archivos en esta colección
                $files = Storage::disk($diskName)->files($directoryPath);
                $totalFiles += count($files);

                if ($isVerbose) {
                    $this->info("Encontrados " . count($files) . " archivos en {$directoryPath}");
                }

                $progressBar = $this->output->createProgressBar(count($files));
                $progressBar->start();

                foreach ($files as $file) {
                    $fileName = basename($file);

                    if ($isVerbose) {
                        $this->line("Verificando archivo: {$fileName}");
                    }

                    // Verificar si este archivo está en la base de datos
                    $exists = Media::where('file_name', $fileName)->exists();

                    if (!$exists) {
                        // Este archivo no está en la base de datos, es huérfano
                        if ($isVerbose) {
                            $this->warn("Archivo huérfano encontrado: {$file}");
                        }

                        if (!$isDryRun) {
                            try {
                                Storage::disk($diskName)->delete($file);
                                if ($isVerbose) {
                                    $this->info("Archivo huérfano eliminado: {$file}");
                                }
                                $orphanedFiles++;
                            } catch (\Exception $e) {
                                $this->error("Error al eliminar {$file}: {$e->getMessage()}");
                                $errors++;
                            }
                        } else {
                            $orphanedFiles++;
                            if ($isVerbose) {
                                $this->line("Archivo huérfano encontrado (no eliminado - modo simulación): {$file}");
                            }
                        }
                    } elseif ($isVerbose) {
                        $this->line("El archivo {$fileName} existe en la base de datos");
                    }

                    $progressBar->advance();
                }

                $progressBar->finish();
                $this->newLine();
            }

            // También revisar directamente el directorio media por si hay archivos fuera de las colecciones
            $rootFiles = Storage::disk($diskName)->files($mediaDirectory);
            $rootFilesCount = count($rootFiles);
            $totalFiles += $rootFilesCount;

            if ($isVerbose) {
                $this->info("Encontrados {$rootFilesCount} archivos en la raíz de {$mediaDirectory}");
            }

            if ($rootFilesCount > 0) {
                $progressBar = $this->output->createProgressBar($rootFilesCount);
                $progressBar->start();

                foreach ($rootFiles as $file) {
                    $fileName = basename($file);

                    if ($isVerbose) {
                        $this->line("Verificando archivo en raíz: {$fileName}");
                    }

                    // Verificar si este archivo está en la base de datos
                    $exists = Media::where('file_name', $fileName)->exists();

                    if (!$exists) {
                        // Este archivo no está en la base de datos, es huérfano
                        if ($isVerbose) {
                            $this->warn("Archivo huérfano encontrado en raíz: {$file}");
                        }

                        if (!$isDryRun) {
                            try {
                                Storage::disk($diskName)->delete($file);
                                if ($isVerbose) {
                                    $this->info("Archivo huérfano eliminado: {$file}");
                                }
                                $orphanedFiles++;
                            } catch (\Exception $e) {
                                $this->error("Error al eliminar {$file}: {$e->getMessage()}");
                                $errors++;
                            }
                        } else {
                            $orphanedFiles++;
                            if ($isVerbose) {
                                $this->line("Archivo huérfano encontrado (no eliminado - modo simulación): {$file}");
                            }
                        }
                    }

                    $progressBar->advance();
                }

                $progressBar->finish();
                $this->newLine();
            }

            $actionText = $isDryRun ? "se encontraron" : "se eliminaron";
            $this->info("Limpieza completada. {$actionText} {$orphanedFiles} archivos huérfanos de un total de {$totalFiles} archivos.");

            if ($errors > 0) {
                $this->warn("Se produjeron {$errors} errores durante el proceso.");
                return Command::FAILURE;
            }

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error al limpiar archivos huérfanos: {$e->getMessage()}");
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }
}