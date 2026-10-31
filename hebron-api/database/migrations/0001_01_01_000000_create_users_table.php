<?php

use App\Enums\UserRole;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // 1. Primary ID
            $table->id();

            // 3. Basic Info
            $table->string('username')->unique();
            $table->string('name');
            $table->string('email')->nullable()->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');

            // 4. Contact & Address
            $table->string('phone', 20)->nullable();
            $table->string('mobile', 20)->nullable();
            $table->string('postcode', 10)->nullable();
            $table->string('address')->nullable();
            $table->string('detailed_address')->nullable();

            // 5. Company / Org Info
            $table->string('authority')->nullable();
            $table->string('headquarters')->nullable();
            $table->string('business_office')->nullable();
            $table->string('team')->nullable();
            $table->string('position')->nullable();

            // 6. Status & Membership
            $table->string('status')->default('active');
            $table->string('registration_path')->default('direct');
            $table->string('member_type')->default('individual')->comment('Member type: individual, business');

            // 7. Business info
            $table->string('company_name')->nullable()->comment('Customer company name');
            $table->string('business_registration_number')->unique()->nullable()->index()->comment('Business tax ID');
            $table->string('representative_name')->nullable();
            $table->string('industry_type')->nullable()->comment('업종');
            $table->string('business_type')->nullable()->comment('사업종');
            $table->string('business_postcode')->nullable()->comment('사업자번호');
            $table->string('business_address')->nullable()->comment('사업 주소');
            $table->string('business_address_detail')->nullable()->comment('사업 주소 상세');
            $table->string('tax_invoice_email')->nullable()->comment('전자세금계산서 이메일');
            $table->string('homepage_url')->nullable()->comment('홈페이지 URL');
            $table->string('business_registration_file')->nullable()->comment('사업자등록증 파일 경로');

            // 8. Agreements & Logs
            $table->boolean('agree_privacy')->default(false);
            $table->boolean('agree_terms')->default(false);
            $table->boolean('agree_sms')->default(false)->comment('SMS 수신동의 (필수)');
            $table->boolean('agree_email')->default(false)->comment('이메일 수신동의 (선택)');
            $table->timestamp('agreed_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
