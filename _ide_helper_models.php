<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $legal_case_id
 * @property int $user_id
 * @property string $title
 * @property string $description
 * @property \Illuminate\Support\Carbon $date
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\LegalCase $legalCase
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereLegalCaseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseEvent whereUserId($value)
 */
	final class CaseEvent extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $legal_case_id
 * @property string $title
 * @property string|null $description
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon $end_date
 * @property bool $is_expired
 * @property int $created_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\User $creator
 * @property-read \App\Models\LegalCase $legalCase
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereCreatedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereIsExpired($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereLegalCaseId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereStartDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseImportantDate withoutTrashed()
 */
	class CaseImportantDate extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LegalCase> $legalCases
 * @property-read int|null $legal_cases_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CaseType withoutTrashed()
 */
	class CaseType extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $national_id
 * @property string|null $passport
 * @property string $first_name
 * @property string|null $middle_name
 * @property string $last_name
 * @property string|null $second_last_name
 * @property string|null $birth_date
 * @property string|null $gender
 * @property string|null $civil_status
 * @property string|null $rif
 * @property string|null $email_1
 * @property string|null $email_2
 * @property string|null $phone_number_1
 * @property string|null $phone_number_2
 * @property string|null $address_line_1
 * @property string|null $address_line_2
 * @property string|null $city
 * @property string|null $state
 * @property string $country
 * @property string $nationality
 * @property string|null $occupation
 * @property string|null $educational_level
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LegalCase> $legalCases
 * @property-read int|null $legal_cases_count
 * @property \Illuminate\Database\Eloquent\Collection<int, \Spatie\Tags\Tag> $tags
 * @property-read int|null $tags_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereBirthDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereCivilStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereEducationalLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereEmail1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereEmail2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereMiddleName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereNationalId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereNationality($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereOccupation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual wherePassport($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual wherePhoneNumber1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual wherePhoneNumber2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereRif($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereSecondLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withAllTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withAllTagsOfAnyType($tags)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withAnyTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withAnyTagsOfAnyType($tags)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withAnyTagsOfType(array|string $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withoutTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Individual withoutTrashed()
 */
	class Individual extends \Eloquent implements \Spatie\Searchable\Searchable {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $code
 * @property \Illuminate\Support\Carbon $entry_date
 * @property \Illuminate\Support\Carbon|null $sentence_date
 * @property \Illuminate\Support\Carbon|null $closing_date
 * @property int $case_type_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\CaseType $caseType
 * @property-read \Spatie\ModelStatus\Status|null $currentStatus
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CaseEvent> $events
 * @property-read int|null $events_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\CaseImportantDate> $importantDates
 * @property-read int|null $important_dates_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Individual> $individuals
 * @property-read int|null $individuals_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LegalEntity> $legalEntities
 * @property-read int|null $legal_entities_count
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection<int, \Spatie\MediaLibrary\MediaCollections\Models\Media> $media
 * @property-read int|null $media_count
 * @property \Illuminate\Database\Eloquent\Collection<int, \Spatie\Tags\Tag> $tags
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\ModelStatus\Status> $statuses
 * @property-read int|null $statuses_count
 * @property-read int|null $tags_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase currentStatus(...$names)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase otherCurrentStatus(...$names)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereCaseTypeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereClosingDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereEntryDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereSentenceDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withAllTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withAllTagsOfAnyType($tags)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withAnyTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withAnyTagsOfAnyType($tags)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withAnyTagsOfType(array|string $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withoutTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalCase withoutTrashed()
 */
	final class LegalCase extends \Eloquent implements \Spatie\MediaLibrary\HasMedia, \Spatie\Searchable\Searchable {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $rif
 * @property string $business_name
 * @property string|null $trade_name
 * @property string $legal_entity_type
 * @property string|null $registration_number
 * @property string|null $registration_date
 * @property string $fiscal_address_line_1
 * @property string|null $fiscal_address_line_2
 * @property string $fiscal_city
 * @property string $fiscal_state
 * @property string $fiscal_country
 * @property string|null $email_1
 * @property string|null $email_2
 * @property string|null $phone_number_1
 * @property string|null $phone_number_2
 * @property string|null $website
 * @property int|null $legal_representative_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LegalCase> $legalCases
 * @property-read int|null $legal_cases_count
 * @property-read \App\Models\Individual|null $legalRepresentative
 * @property \Illuminate\Database\Eloquent\Collection<int, \Spatie\Tags\Tag> $tags
 * @property-read int|null $tags_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereBusinessName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereEmail1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereEmail2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereFiscalAddressLine1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereFiscalAddressLine2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereFiscalCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereFiscalCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereFiscalState($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereLegalEntityType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereLegalRepresentativeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity wherePhoneNumber1($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity wherePhoneNumber2($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereRegistrationDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereRegistrationNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereRif($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereTradeName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity whereWebsite($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withAllTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withAllTagsOfAnyType($tags)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withAnyTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withAnyTagsOfAnyType($tags)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withAnyTagsOfType(array|string $type)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withoutTags(\ArrayAccess|\Spatie\Tags\Tag|array|string $tags, ?string $type = null)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LegalEntity withoutTrashed()
 */
	class LegalEntity extends \Eloquent implements \Spatie\Searchable\Searchable {}
}

namespace App\Models{
/**
 * Modelo para gestionar los archivos compartidos de la biblioteca multimedia.
 * 
 * Este modelo actúa como propietario de los archivos compartidos que no pertenecen
 * a ningún usuario específico, permitiendo una gestión centralizada de los mismos.
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection<int, \Spatie\MediaLibrary\MediaCollections\Models\Media> $media
 * @property-read int|null $media_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|MediaOwner whereUpdatedAt($value)
 */
	class MediaOwner extends \Eloquent implements \Spatie\MediaLibrary\HasMedia {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string|null $reason
 * @property string $model_type
 * @property int $model_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Todo> $todos
 * @property-read int|null $todos_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereModelId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereModelType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status withTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Status withoutTrashed()
 */
	final class Status extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatusList whereUpdatedAt($value)
 */
	final class StatusList extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $todo_list_id
 * @property string $title
 * @property bool $is_completed
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\TodoList $todoList
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo whereIsCompleted($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo whereTodoListId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Todo whereUpdatedAt($value)
 */
	final class Todo extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Todo> $todos
 * @property-read int|null $todos_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TodoList whereUserId($value)
 */
	final class TodoList extends \Eloquent {}
}

namespace App\Models{
/**
 * 
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection<int, \Spatie\MediaLibrary\MediaCollections\Models\Media> $media
 * @property-read int|null $media_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Spatie\Permission\Models\Role> $roles
 * @property-read int|null $roles_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User permission($permissions, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User role($roles, $guard = null, $without = false)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutPermission($permissions)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User withoutRole($roles, $guard = null)
 */
	class User extends \Eloquent implements \Spatie\MediaLibrary\HasMedia, \Spatie\Searchable\Searchable {}
}

