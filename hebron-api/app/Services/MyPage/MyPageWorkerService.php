<?php

namespace App\Services\MyPage;

use App\Http\Resources\WorkerResource;
use App\Models\User;
use App\Models\Worker;
use App\Services\PaginationService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class MyPageWorkerService
{
    public function __construct(
        protected PaginationService $paginationService,
    ) {}

    public function getWorkers(User $user, ?string $searchType, ?string $keyword, int $perPage): array
    {
        if (! $user->customer_id) {
            throw new \InvalidArgumentException('기업회원만 작업자 목록을 조회할 수 있습니다.');
        }

        $query = Worker::where('customer_id', $user->customer_id);

        if ($keyword) {
            $field = in_array($searchType, ['name', 'mobile']) ? $searchType : 'name';
            $query->where($field, 'like', "%{$keyword}%");
        }

        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return [
            'items'      => WorkerResource::collection($paginator->items()),
            'pagination' => $this->paginationService->format($paginator),
        ];
    }

    public function getWorker(User $user, int $id): WorkerResource
    {
        $worker = Worker::where('customer_id', $user->customer_id)->findOrFail($id);

        return new WorkerResource($worker);
    }

    public function createWorker(User $user, array $data): WorkerResource
    {
        if (! $user->customer_id) {
            throw new \InvalidArgumentException('기업회원만 작업자를 등록할 수 있습니다.');
        }

        $worker = Worker::create([
            'customer_id' => $user->customer_id,
            'name'        => $data['name'],
            'mobile'      => $data['mobile'],
        ]);

        return new WorkerResource($worker);
    }

    public function updateWorker(User $user, int $id, array $data): WorkerResource
    {
        $worker = Worker::where('customer_id', $user->customer_id)->findOrFail($id);
        $worker->update(array_filter($data, fn ($v) => $v !== null));

        return new WorkerResource($worker->fresh());
    }

    /**
     * @throws ModelNotFoundException
     */
    public function deleteWorker(User $user, int $id): void
    {
        Worker::where('customer_id', $user->customer_id)->findOrFail($id)->delete();
    }

    public function batchDeleteWorkers(User $user, array $ids): int
    {
        return Worker::where('customer_id', $user->customer_id)->whereIn('id', $ids)->delete();
    }

}
