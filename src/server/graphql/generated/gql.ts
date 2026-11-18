/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query Users($filter: UserFilterInput, $page: PageInput) {\n    users(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...UserAccountFields\n      }\n    }\n  }\n": typeof types.UsersDocument,
    "\n  fragment UserAccountFields on UserAccount {\n    id\n    name\n    email\n    username\n    group\n    active\n    kind\n    unitId\n    unitLabel\n    unitComplement\n    employee {\n      jobTitle\n      hiredOn\n      workShift\n      contractor\n    }\n    phone\n    birthDate\n    photoUrl\n    sharedAccount\n    mustChangePassword\n    lockedUntil\n    locked\n    lastLoginAt\n    deactivatedAt\n    createdAt\n  }\n": typeof types.UserAccountFieldsFragmentDoc,
    "\n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserAccountFields\n    }\n  }\n": typeof types.UserDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      temporaryPassword\n      emailSent\n      existingAccount\n      user {\n        ...UserAccountFields\n      }\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserAccountFields\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation SetUserActive($id: ID!, $active: Boolean!) {\n    setUserActive(id: $id, active: $active) {\n      ...UserAccountFields\n    }\n  }\n": typeof types.SetUserActiveDocument,
    "\n  mutation ResetUserPassword($id: ID!) {\n    resetUserPassword(id: $id) {\n      temporaryPassword\n      emailSent\n      user {\n        ...UserAccountFields\n      }\n    }\n  }\n": typeof types.ResetUserPasswordDocument,
    "\n  mutation UnlockUser($id: ID!) {\n    unlockUser(id: $id) {\n      ...UserAccountFields\n    }\n  }\n": typeof types.UnlockUserDocument,
    "\n  mutation RevokeUserSessions($id: ID!) {\n    revokeUserSessions(id: $id) {\n      ...UserAccountFields\n    }\n  }\n": typeof types.RevokeUserSessionsDocument,
    "\n  query UserPermissions($id: ID!) {\n    userPermissions(id: $id) {\n      effective\n      defaults\n      overrides {\n        permission\n        allowed\n      }\n    }\n  }\n": typeof types.UserPermissionsDocument,
    "\n  mutation SetUserPermissions($input: SetUserPermissionsInput!) {\n    setUserPermissions(input: $input) {\n      effective\n      defaults\n      overrides {\n        permission\n        allowed\n      }\n    }\n  }\n": typeof types.SetUserPermissionsDocument,
    "\n  query RecordStamp($entity: String!, $id: ID!) {\n    recordStamp(entity: $entity, id: $id) {\n      createdAt\n      createdByName\n      updatedAt\n      updatedByName\n    }\n  }\n": typeof types.RecordStampDocument,
    "\n  query AppInfo {\n    appInfo {\n      version\n      commit\n      deployedAt\n    }\n  }\n": typeof types.AppInfoDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      accessTokenExpiresAt\n      refreshToken\n      refreshTokenExpiresAt\n      user {\n        id\n        name\n        username\n        email\n        group\n        mustChangePassword\n        permissions\n        photoUrl\n        phone\n        birthDate\n        onboardingCompleted\n        platformAdmin\n        member\n        condominium {\n          id\n          name\n          city\n          state\n          status\n          addressFormat\n          modules\n        }\n        condominiums {\n          id\n          name\n          city\n          state\n          role\n        }\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation RefreshSession($refreshToken: String!) {\n    refreshSessionTokens(refreshToken: $refreshToken) {\n      accessToken\n      accessTokenExpiresAt\n      refreshToken\n      refreshTokenExpiresAt\n    }\n  }\n": typeof types.RefreshSessionDocument,
    "\n  mutation Logout {\n    logout\n  }\n": typeof types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      username\n      email\n      group\n      mustChangePassword\n      permissions\n      photoUrl\n      phone\n      birthDate\n      onboardingCompleted\n      platformAdmin\n      member\n      condominium {\n        id\n        name\n        city\n        state\n        status\n        addressFormat\n        modules\n      }\n      condominiums {\n        id\n        name\n        city\n        state\n        role\n      }\n    }\n  }\n": typeof types.MeDocument,
    "\n  mutation CompleteOnboarding {\n    completeOnboarding\n  }\n": typeof types.CompleteOnboardingDocument,
    "\n  mutation ChangeMyPassword($input: ChangePasswordInput!) {\n    changeMyPassword(input: $input)\n  }\n": typeof types.ChangeMyPasswordDocument,
    "\n  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      name\n      username\n      email\n      group\n      mustChangePassword\n      permissions\n      photoUrl\n      phone\n      birthDate\n      onboardingCompleted\n      platformAdmin\n      member\n      condominium {\n        id\n        name\n        city\n        state\n        status\n        addressFormat\n        modules\n      }\n      condominiums {\n        id\n        name\n        city\n        state\n        role\n      }\n    }\n  }\n": typeof types.UpdateMyProfileDocument,
    "\n  mutation SetMyPhoto($photo: String!) {\n    setMyPhoto(photo: $photo)\n  }\n": typeof types.SetMyPhotoDocument,
    "\n  mutation RemoveMyPhoto {\n    removeMyPhoto\n  }\n": typeof types.RemoveMyPhotoDocument,
    "\n  mutation RequestPasswordRecovery($login: String!) {\n    requestPasswordRecovery(login: $login)\n  }\n": typeof types.RequestPasswordRecoveryDocument,
    "\n  mutation VerifyPasswordRecoveryCode($input: VerifyRecoveryCodeInput!) {\n    verifyPasswordRecoveryCode(input: $input)\n  }\n": typeof types.VerifyPasswordRecoveryCodeDocument,
    "\n  mutation ResetPasswordWithRecovery($input: ResetPasswordInput!) {\n    resetPasswordWithRecovery(input: $input)\n  }\n": typeof types.ResetPasswordWithRecoveryDocument,
    "\n  mutation SwitchCondominium($condominiumId: ID) {\n    switchCondominium(condominiumId: $condominiumId)\n  }\n": typeof types.SwitchCondominiumDocument,
    "\n  fragment BookingFields on Booking {\n    id\n    spaceId\n    spaceName\n    spaceKind\n    guestsAllowed\n    userId\n    userName\n    unitLabel\n    startsAt\n    endsAt\n    status\n    notes\n    cancelUntil\n    reason\n    decidedAt\n    cancelledAt\n    cancelledByManager\n    feeCents\n    feeBilledAt\n    seriesId\n    createdAt\n  }\n": typeof types.BookingFieldsFragmentDoc,
    "\n  query MyBookings($when: BookingWhen!, $page: PageInput) {\n    myBookings(when: $when, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...BookingFields\n      }\n    }\n  }\n": typeof types.MyBookingsDocument,
    "\n  query Bookings($filter: BookingFilterInput, $page: PageInput) {\n    bookings(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...BookingFields\n      }\n    }\n  }\n": typeof types.BookingsDocument,
    "\n  query SpaceAvailability($spaceId: ID!, $date: String!) {\n    spaceAvailability(spaceId: $spaceId, date: $date) {\n      spaceId\n      date\n      firstDate\n      lastDate\n      slots {\n        startsAt\n        endsAt\n        state\n        bookingId\n        bookingStatus\n        label\n        waitlisted\n      }\n    }\n  }\n": typeof types.SpaceAvailabilityDocument,
    "\n  mutation CreateBooking($input: CreateBookingInput!) {\n    createBooking(input: $input) {\n      ...BookingFields\n    }\n  }\n": typeof types.CreateBookingDocument,
    "\n  mutation CancelBooking($id: ID!, $reason: String) {\n    cancelBooking(id: $id, reason: $reason) {\n      ...BookingFields\n    }\n  }\n": typeof types.CancelBookingDocument,
    "\n  mutation ApproveBooking($id: ID!) {\n    approveBooking(id: $id) {\n      ...BookingFields\n    }\n  }\n": typeof types.ApproveBookingDocument,
    "\n  mutation RejectBooking($id: ID!, $reason: String!) {\n    rejectBooking(id: $id, reason: $reason) {\n      ...BookingFields\n    }\n  }\n": typeof types.RejectBookingDocument,
    "\n  query CondominiumSpaceBlocks {\n    condominiumSpaceBlocks {\n      id\n      spaceId\n      startsAt\n      endsAt\n      reason\n      createdByName\n      createdAt\n    }\n  }\n": typeof types.CondominiumSpaceBlocksDocument,
    "\n  query SpaceBlocks($spaceId: ID!) {\n    spaceBlocks(spaceId: $spaceId) {\n      id\n      spaceId\n      startsAt\n      endsAt\n      reason\n      createdByName\n      createdAt\n    }\n  }\n": typeof types.SpaceBlocksDocument,
    "\n  mutation CreateSpaceBlock($input: CreateSpaceBlockInput!) {\n    createSpaceBlock(input: $input) {\n      id\n    }\n  }\n": typeof types.CreateSpaceBlockDocument,
    "\n  mutation DeleteSpaceBlock($id: ID!) {\n    deleteSpaceBlock(id: $id)\n  }\n": typeof types.DeleteSpaceBlockDocument,
    "\n  mutation CreateBookingSeries($input: CreateBookingSeriesInput!) {\n    createBookingSeries(input: $input) {\n      seriesId\n      created {\n        ...BookingFields\n      }\n      skipped {\n        startsAt\n        reason\n      }\n    }\n  }\n": typeof types.CreateBookingSeriesDocument,
    "\n  mutation CancelBookingSeries($seriesId: ID!) {\n    cancelBookingSeries(seriesId: $seriesId) {\n      cancelled\n      kept\n    }\n  }\n": typeof types.CancelBookingSeriesDocument,
    "\n  mutation JoinWaitlist($input: WaitlistSlotInput!) {\n    joinWaitlist(input: $input)\n  }\n": typeof types.JoinWaitlistDocument,
    "\n  mutation LeaveWaitlist($input: WaitlistSlotInput!) {\n    leaveWaitlist(input: $input)\n  }\n": typeof types.LeaveWaitlistDocument,
    "\n  fragment BookingGuestFields on BookingGuest {\n    id\n    bookingId\n    name\n    documentType\n    document\n    phone\n    code\n    checkedInAt\n    createdAt\n  }\n": typeof types.BookingGuestFieldsFragmentDoc,
    "\n  query BookingGuests($bookingId: ID!) {\n    bookingGuests(bookingId: $bookingId) {\n      ...BookingGuestFields\n    }\n  }\n": typeof types.BookingGuestsDocument,
    "\n  mutation AddBookingGuests($input: AddBookingGuestsInput!) {\n    addBookingGuests(input: $input) {\n      ...BookingGuestFields\n    }\n  }\n": typeof types.AddBookingGuestsDocument,
    "\n  mutation RemoveBookingGuest($id: ID!) {\n    removeBookingGuest(id: $id)\n  }\n": typeof types.RemoveBookingGuestDocument,
    "\n  query GuestInvite($code: String!) {\n    guestInvite(code: $code) {\n      code\n      guestName\n      hostFirstName\n      spaceName\n      condominiumName\n      startsAt\n      endsAt\n      status\n      checkedIn\n    }\n  }\n": typeof types.GuestInviteDocument,
    "\n  fragment GateGuestFields on GateGuest {\n    id\n    bookingId\n    name\n    documentType\n    document\n    phone\n    code\n    checkedInAt\n    spaceName\n    startsAt\n    endsAt\n    hostName\n    unitLabel\n    checkInWindow\n  }\n": typeof types.GateGuestFieldsFragmentDoc,
    "\n  query GateGuests($date: String) {\n    gateGuests(date: $date) {\n      ...GateGuestFields\n    }\n  }\n": typeof types.GateGuestsDocument,
    "\n  query DayGuests(\n    $date: String\n    $filter: DayGuestFilterInput\n    $page: PageInput\n  ) {\n    dayGuests(date: $date, filter: $filter, page: $page) {\n      items {\n        ...GateGuestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.DayGuestsDocument,
    "\n  query DayGuestsOverview($date: String) {\n    dayGuestsOverview(date: $date) {\n      total\n      checkedIn\n      bookings\n      guests {\n        id\n        label\n      }\n      hosts {\n        id\n        label\n      }\n      units {\n        id\n        label\n      }\n      spaces {\n        id\n        label\n      }\n    }\n  }\n": typeof types.DayGuestsOverviewDocument,
    "\n  mutation CheckInGuest($input: CheckInGuestInput!) {\n    checkInGuest(input: $input) {\n      ...GateGuestFields\n    }\n  }\n": typeof types.CheckInGuestDocument,
    "\n  mutation UndoGuestCheckIn($guestId: ID!) {\n    undoGuestCheckIn(guestId: $guestId) {\n      ...GateGuestFields\n    }\n  }\n": typeof types.UndoGuestCheckInDocument,
    "\n  query BookingFees($month: String, $filter: FeeFilterInput) {\n    bookingFees(month: $month, filter: $filter) {\n      month\n      totalCents\n      billedCents\n      items {\n        ...BookingFields\n      }\n    }\n  }\n": typeof types.BookingFeesDocument,
    "\n  query BookingFeesPage(\n    $month: String\n    $filter: FeeFilterInput\n    $page: PageInput\n  ) {\n    bookingFeesPage(month: $month, filter: $filter, page: $page) {\n      items {\n        ...BookingFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.BookingFeesPageDocument,
    "\n  query BookingFeesOverview($month: String) {\n    bookingFeesOverview(month: $month) {\n      month\n      count\n      totalCents\n      billedCents\n      units {\n        id\n        label\n      }\n      spaces {\n        id\n        label\n      }\n      users {\n        id\n        label\n      }\n    }\n  }\n": typeof types.BookingFeesOverviewDocument,
    "\n  mutation SetBookingFeesBilled($input: SetBookingFeesBilledInput!) {\n    setBookingFeesBilled(input: $input)\n  }\n": typeof types.SetBookingFeesBilledDocument,
    "\n  fragment BroadcastFields on Broadcast {\n    id\n    title\n    body\n    audience\n    targetGroup\n    sendEmail\n    recipients\n    authorName\n    createdAt\n  }\n": typeof types.BroadcastFieldsFragmentDoc,
    "\n  query Broadcasts {\n    broadcasts {\n      ...BroadcastFields\n    }\n  }\n": typeof types.BroadcastsDocument,
    "\n  mutation SendBroadcast($input: BroadcastInput!) {\n    sendBroadcast(input: $input) {\n      ...BroadcastFields\n    }\n  }\n": typeof types.SendBroadcastDocument,
    "\n  fragment CondominiumFields on Condominium {\n    id\n    name\n    document\n    city\n    state\n    status\n    addressFormat\n    modules\n    activeMembers\n    managers\n    units\n    pendingEnrollments\n    lastActivityAt\n    createdAt\n  }\n": typeof types.CondominiumFieldsFragmentDoc,
    "\n  query Condominiums($filter: CondominiumFilterInput) {\n    condominiums(filter: $filter) {\n      ...CondominiumFields\n    }\n  }\n": typeof types.CondominiumsDocument,
    "\n  mutation CreateCondominium($input: CondominiumInput!) {\n    createCondominium(input: $input) {\n      ...CondominiumFields\n    }\n  }\n": typeof types.CreateCondominiumDocument,
    "\n  mutation UpdateCondominium($id: ID!, $input: CondominiumInput!) {\n    updateCondominium(id: $id, input: $input) {\n      ...CondominiumFields\n    }\n  }\n": typeof types.UpdateCondominiumDocument,
    "\n  mutation SetCondominiumStatus($id: ID!, $status: CondominiumStatus!) {\n    setCondominiumStatus(id: $id, status: $status) {\n      ...CondominiumFields\n    }\n  }\n": typeof types.SetCondominiumStatusDocument,
    "\n  mutation SetCondominiumModule(\n    $id: ID!\n    $module: AppModule!\n    $enabled: Boolean!\n  ) {\n    setCondominiumModule(id: $id, module: $module, enabled: $enabled) {\n      ...CondominiumFields\n    }\n  }\n": typeof types.SetCondominiumModuleDocument,
    "\n  fragment UnitFields on Unit {\n    id\n    street\n    block\n    number\n    label\n    residents\n  }\n": typeof types.UnitFieldsFragmentDoc,
    "\n  query Units {\n    units {\n      ...UnitFields\n    }\n  }\n": typeof types.UnitsDocument,
    "\n  mutation CreateUnits($input: CreateUnitsInput!) {\n    createUnits(input: $input) {\n      ...UnitFields\n    }\n  }\n": typeof types.CreateUnitsDocument,
    "\n  mutation UpdateUnit($id: ID!, $input: UpdateUnitInput!) {\n    updateUnit(id: $id, input: $input) {\n      ...UnitFields\n    }\n  }\n": typeof types.UpdateUnitDocument,
    "\n  mutation DeleteUnit($id: ID!) {\n    deleteUnit(id: $id)\n  }\n": typeof types.DeleteUnitDocument,
    "\n  query Condominium($id: ID!) {\n    condominium(id: $id) {\n      ...CondominiumFields\n    }\n  }\n": typeof types.CondominiumDocument,
    "\n  query Dashboard {\n    dashboard {\n      activeUsers\n      pendingEnrollments\n      units\n      activeSpaces\n      pendingBookings\n      bookingsToday\n      openSupportRequests\n      failedNotifications\n    }\n  }\n": typeof types.DashboardDocument,
    "\n  fragment DependentFields on Dependent {\n    id\n    name\n    birthDate\n    relationship\n    status\n    holderName\n    unitLabel\n    rejectReason\n    reviewedAt\n    createdAt\n    documentUrl\n    documentContentType\n  }\n": typeof types.DependentFieldsFragmentDoc,
    "\n  query MyDependents {\n    myDependents {\n      ...DependentFields\n    }\n  }\n": typeof types.MyDependentsDocument,
    "\n  mutation AddDependent($input: DependentInput!) {\n    addDependent(input: $input) {\n      ...DependentFields\n    }\n  }\n": typeof types.AddDependentDocument,
    "\n  mutation RemoveDependent($id: ID!) {\n    removeDependent(id: $id)\n  }\n": typeof types.RemoveDependentDocument,
    "\n  query Dependents($status: DependentStatus) {\n    dependents(status: $status) {\n      ...DependentFields\n    }\n  }\n": typeof types.DependentsDocument,
    "\n  mutation ApproveDependent($id: ID!) {\n    approveDependent(id: $id) {\n      ...DependentFields\n    }\n  }\n": typeof types.ApproveDependentDocument,
    "\n  mutation RejectDependent($id: ID!, $reason: String!) {\n    rejectDependent(id: $id, reason: $reason) {\n      ...DependentFields\n    }\n  }\n": typeof types.RejectDependentDocument,
    "\n  mutation VerifyEnrollmentCode($code: String!) {\n    verifyEnrollmentCode(code: $code)\n  }\n": typeof types.VerifyEnrollmentCodeDocument,
    "\n  query EnrollmentForm($formToken: String!) {\n    enrollmentForm(formToken: $formToken) {\n      condominiumName\n      addressFormat\n      units {\n        id\n        label\n      }\n    }\n  }\n": typeof types.EnrollmentFormDocument,
    "\n  mutation SubmitEnrollment($input: SubmitEnrollmentInput!) {\n    submitEnrollment(input: $input)\n  }\n": typeof types.SubmitEnrollmentDocument,
    "\n  fragment EnrollmentInviteFields on EnrollmentInvite {\n    id\n    code\n    label\n    expiresAt\n    revokedAt\n    createdAt\n    requestCount\n  }\n": typeof types.EnrollmentInviteFieldsFragmentDoc,
    "\n  fragment EnrollmentRequestFields on EnrollmentRequest {\n    id\n    status\n    applicant\n    fullName\n    email\n    phone\n    birthDate\n    unitId\n    unitLabel\n    unitComplement\n    typedUnitLabel\n    typedUnitBlock\n    typedUnitNumber\n    typedUnitStreet\n    createdAt\n    reviewedAt\n    rejectionReason\n    userId\n    photoUrl\n  }\n": typeof types.EnrollmentRequestFieldsFragmentDoc,
    "\n  query EnrollmentInvites {\n    enrollmentInvites {\n      ...EnrollmentInviteFields\n    }\n  }\n": typeof types.EnrollmentInvitesDocument,
    "\n  mutation CreateEnrollmentInvite($input: CreateEnrollmentInviteInput!) {\n    createEnrollmentInvite(input: $input) {\n      ...EnrollmentInviteFields\n    }\n  }\n": typeof types.CreateEnrollmentInviteDocument,
    "\n  mutation RevokeEnrollmentInvite($id: ID!) {\n    revokeEnrollmentInvite(id: $id) {\n      ...EnrollmentInviteFields\n    }\n  }\n": typeof types.RevokeEnrollmentInviteDocument,
    "\n  query EnrollmentRequests(\n    $filter: EnrollmentRequestFilterInput\n    $page: PageInput\n  ) {\n    enrollmentRequests(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...EnrollmentRequestFields\n      }\n    }\n    pendingEnrollmentCount\n  }\n": typeof types.EnrollmentRequestsDocument,
    "\n  mutation ApproveEnrollmentRequest(\n    $id: ID!\n    $data: EnrollmentDataInput!\n    $group: UserGroup!\n  ) {\n    approveEnrollmentRequest(id: $id, data: $data, group: $group) {\n      request {\n        ...EnrollmentRequestFields\n      }\n      access {\n        temporaryPassword\n        emailSent\n        existingAccount\n        user {\n          ...UserAccountFields\n        }\n      }\n    }\n  }\n": typeof types.ApproveEnrollmentRequestDocument,
    "\n  mutation RejectEnrollmentRequest($id: ID!, $reason: String!) {\n    rejectEnrollmentRequest(id: $id, reason: $reason) {\n      ...EnrollmentRequestFields\n    }\n  }\n": typeof types.RejectEnrollmentRequestDocument,
    "\n  fragment EventFields on Event {\n    id\n    title\n    description\n    spaceId\n    spaceName\n    location\n    address {\n      zip\n      street\n      number\n      complement\n      district\n      city\n      state\n    }\n    startsAt\n    endsAt\n    capacity\n    externalGuestLimit\n    ticketed\n    fullPriceCents\n    ticketTypes {\n      id\n      kind\n      name\n      priceMode\n      customPriceCents\n      priceCents\n      minAge\n      maxAge\n    }\n    unitTicketLimit\n    salesClose\n    salesCloseHours\n    salesClosesAt\n    pixSource\n    customPix {\n      keyType\n      key\n      name\n      city\n    }\n    placesLeft\n    outsidePlacesLeft\n    status\n    cancelReason\n    publishedAt\n    cancelledAt\n    createdAt\n  }\n": typeof types.EventFieldsFragmentDoc,
    "\n  query Events($when: EventWhen) {\n    events(when: $when) {\n      ...EventFields\n    }\n  }\n": typeof types.EventsDocument,
    "\n  query Event($id: ID!) {\n    event(id: $id) {\n      ...EventFields\n    }\n  }\n": typeof types.EventDocument,
    "\n  mutation CreateEvent($input: EventInput!) {\n    createEvent(input: $input) {\n      ...EventFields\n    }\n  }\n": typeof types.CreateEventDocument,
    "\n  mutation UpdateEvent($id: ID!, $input: EventInput!) {\n    updateEvent(id: $id, input: $input) {\n      ...EventFields\n    }\n  }\n": typeof types.UpdateEventDocument,
    "\n  mutation PublishEvent($id: ID!) {\n    publishEvent(id: $id) {\n      ...EventFields\n    }\n  }\n": typeof types.PublishEventDocument,
    "\n  mutation CancelEvent($id: ID!, $reason: String!) {\n    cancelEvent(id: $id, reason: $reason) {\n      ...EventFields\n    }\n  }\n": typeof types.CancelEventDocument,
    "\n  fragment EventOrderFields on EventOrder {\n    id\n    eventId\n    eventTitle\n    code\n    status\n    totalCents\n    buyerId\n    buyerName\n    unitId\n    unitLabel\n    attendees {\n      id\n      source\n      dependentId\n      name\n      age\n      outside\n      ticketName\n      priceCents\n      needsProof\n      proofUrl\n      proofContentType\n      ticketCode\n      checkedInAt\n    }\n    pix {\n      keyType\n      key\n      name\n      city\n    }\n    pixCode\n    expiresAt\n    receiptSentAt\n    receiptContentType\n    receiptUrl\n    reviewedAt\n    rejectReason\n    cancelledAt\n    createdAt\n  }\n": typeof types.EventOrderFieldsFragmentDoc,
    "\n  query MyEventOrders($eventId: ID!) {\n    myEventOrders(eventId: $eventId) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.MyEventOrdersDocument,
    "\n  query EventOrders(\n    $eventId: ID!\n    $filter: EventOrderFilterInput\n    $page: PageInput\n  ) {\n    eventOrders(eventId: $eventId, filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...EventOrderFields\n      }\n    }\n  }\n": typeof types.EventOrdersDocument,
    "\n  mutation CreateEventOrder($eventId: ID!, $attendees: [AttendeeInput!]!) {\n    createEventOrder(eventId: $eventId, attendees: $attendees) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.CreateEventOrderDocument,
    "\n  mutation SubmitEventOrderReceipt($id: ID!, $file: String!) {\n    submitEventOrderReceipt(id: $id, file: $file) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.SubmitEventOrderReceiptDocument,
    "\n  mutation CancelEventOrder($id: ID!) {\n    cancelEventOrder(id: $id) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.CancelEventOrderDocument,
    "\n  mutation ApproveEventOrder($id: ID!) {\n    approveEventOrder(id: $id) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.ApproveEventOrderDocument,
    "\n  mutation RejectEventOrder($id: ID!, $reason: String!) {\n    rejectEventOrder(id: $id, reason: $reason) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.RejectEventOrderDocument,
    "\n  mutation SubmitEventAttendeeProof(\n    $orderId: ID!\n    $attendeeId: ID!\n    $file: String!\n  ) {\n    submitEventAttendeeProof(\n      orderId: $orderId\n      attendeeId: $attendeeId\n      file: $file\n    ) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.SubmitEventAttendeeProofDocument,
    "\n  fragment GateEventTicketFields on GateEventTicket {\n    id\n    name\n    age\n    outside\n    source\n    ticketName\n    ticketCode\n    checkedInAt\n    entryWindow\n    eventId\n    eventTitle\n    eventStatus\n    startsAt\n    endsAt\n    placeName\n    orderCode\n    buyerName\n    unitId\n    unitLabel\n  }\n": typeof types.GateEventTicketFieldsFragmentDoc,
    "\n  query GateEventTickets($date: String) {\n    gateEventTickets(date: $date) {\n      ...GateEventTicketFields\n    }\n  }\n": typeof types.GateEventTicketsDocument,
    "\n  mutation CheckInEventTicket($input: CheckInEventTicketInput!) {\n    checkInEventTicket(input: $input) {\n      ...GateEventTicketFields\n    }\n  }\n": typeof types.CheckInEventTicketDocument,
    "\n  mutation UndoEventTicketCheckIn($attendeeId: ID!) {\n    undoEventTicketCheckIn(attendeeId: $attendeeId) {\n      ...GateEventTicketFields\n    }\n  }\n": typeof types.UndoEventTicketCheckInDocument,
    "\n  query EventTicketPass($code: String!) {\n    eventTicket(code: $code) {\n      code\n      name\n      ticketName\n      eventTitle\n      placeName\n      condominiumName\n      startsAt\n      endsAt\n      buyerFirstName\n      status\n      checkedIn\n    }\n  }\n": typeof types.EventTicketPassDocument,
    "\n  query EventOrdersQueue($status: EventOrderStatus, $eventId: ID) {\n    eventOrdersQueue(status: $status, eventId: $eventId) {\n      ...EventOrderFields\n    }\n  }\n": typeof types.EventOrdersQueueDocument,
    "\n  query EventTickets(\n    $eventId: ID!\n    $filter: EventTicketFilterInput\n    $page: PageInput\n  ) {\n    eventTickets(eventId: $eventId, filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...GateEventTicketFields\n      }\n    }\n  }\n": typeof types.EventTicketsDocument,
    "\n  query EventTicketOverview($eventId: ID!) {\n    eventTicketOverview(eventId: $eventId) {\n      total\n      checkedIn\n      outside\n      byType {\n        name\n        count\n      }\n      people {\n        id\n        name\n        ticketCode\n      }\n      units {\n        id\n        label\n      }\n    }\n  }\n": typeof types.EventTicketOverviewDocument,
    "\n  query EventOrderOverview($eventId: ID!) {\n    eventOrderOverview(eventId: $eventId) {\n      byStatus {\n        status\n        count\n      }\n      receivedCents\n      confirmedPeople\n      buyers {\n        id\n        name\n      }\n      units {\n        id\n        label\n      }\n      codes {\n        code\n        buyerName\n      }\n    }\n  }\n": typeof types.EventOrderOverviewDocument,
    "\n  query MyNotifications($unreadOnly: Boolean!, $page: PageInput) {\n    myNotifications(unreadOnly: $unreadOnly, page: $page) {\n      items {\n        id\n        type\n        title\n        body\n        link\n        readAt\n        createdAt\n      }\n      total\n      page\n      totalPages\n    }\n  }\n": typeof types.MyNotificationsDocument,
    "\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n": typeof types.UnreadNotificationsCountDocument,
    "\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n": typeof types.MarkNotificationReadDocument,
    "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n": typeof types.MarkAllNotificationsReadDocument,
    "\n  query NotificationPreferences {\n    myNotificationPreferences {\n      type\n      emailEnabled\n    }\n  }\n": typeof types.NotificationPreferencesDocument,
    "\n  mutation SetNotificationPreference(\n    $type: NotificationType!\n    $emailEnabled: Boolean!\n  ) {\n    setNotificationPreference(type: $type, emailEnabled: $emailEnabled) {\n      type\n      emailEnabled\n    }\n  }\n": typeof types.SetNotificationPreferenceDocument,
    "\n  query PushPublicKey {\n    pushPublicKey\n  }\n": typeof types.PushPublicKeyDocument,
    "\n  mutation SubscribePush($input: PushSubscriptionInput!) {\n    subscribePush(input: $input)\n  }\n": typeof types.SubscribePushDocument,
    "\n  mutation UnsubscribePush($endpoint: String!) {\n    unsubscribePush(endpoint: $endpoint)\n  }\n": typeof types.UnsubscribePushDocument,
    "\n  mutation SendTestPush {\n    sendTestPush\n  }\n": typeof types.SendTestPushDocument,
    "\n  query CondominiumPix {\n    condominiumPix {\n      keyType\n      key\n      name\n      city\n    }\n  }\n": typeof types.CondominiumPixDocument,
    "\n  mutation SetCondominiumPix($input: PixReceiverInput!) {\n    setCondominiumPix(input: $input) {\n      keyType\n      key\n      name\n      city\n    }\n  }\n": typeof types.SetCondominiumPixDocument,
    "\n  mutation RemoveCondominiumPix {\n    removeCondominiumPix\n  }\n": typeof types.RemoveCondominiumPixDocument,
    "\n  query PlatformMetrics($filter: PlatformMetricsFilterInput) {\n    platformMetrics(filter: $filter) {\n      from\n      to\n      days\n      condominiumId\n      bookings {\n        total\n        confirmed\n        pending\n        cancelled\n        rejected\n        stalePending\n        granularity\n        series {\n          bucket\n          total\n          cancelled\n        }\n        byCondominium {\n          condominiumId\n          name\n          total\n          cancelled\n        }\n      }\n      spaces {\n        activeSpaces\n        unusedCount\n        mostUsed {\n          spaceId\n          name\n          condominiumName\n          bookings\n          hours\n        }\n        unused {\n          spaceId\n          name\n          condominiumName\n          bookings\n          hours\n        }\n        byWeekday {\n          weekday\n          bookings\n        }\n        byHour {\n          hour\n          bookings\n        }\n      }\n      engagement {\n        members\n        active7d\n        active30d\n        newMembers\n        enrollments\n        inactiveCount\n        inactiveCondominiums {\n          condominiumId\n          name\n          lastActivityAt\n        }\n      }\n      health {\n        staleEnrollments\n        failedNotifications\n        delayedNotifications\n        withoutManager\n        withoutUnits\n        openSupport\n      }\n    }\n  }\n": typeof types.PlatformMetricsDocument,
    "\n  query PlatformPeople($filter: PlatformPeopleFilterInput, $page: PageInput) {\n    platformPeople(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        id\n        name\n        email\n        username\n        phone\n        platformAdmin\n        active\n        lockedUntil\n        lastLoginAt\n        createdAt\n        memberships {\n          condominiumId\n          condominiumName\n          role\n          kind\n          active\n        }\n      }\n    }\n  }\n": typeof types.PlatformPeopleDocument,
    "\n  query CondominiumMembers($condominiumId: ID!) {\n    condominiumMembers(condominiumId: $condominiumId) {\n      userId\n      name\n      email\n      username\n      phone\n      role\n      kind\n      active\n      unitLabel\n      jobTitle\n      lastLoginAt\n      since\n    }\n  }\n": typeof types.CondominiumMembersDocument,
    "\n  fragment SpaceFields on Space {\n    id\n    name\n    kind\n    description\n    capacity\n    usageRules\n    active\n    photos {\n      id\n      url\n    }\n    createdAt\n    updatedAt\n    rules {\n      openingHours {\n        weekday\n        opensAt\n        closesAt\n      }\n      slotMinutes\n      minAdvanceHours\n      maxAdvanceDays\n      unitLimit {\n        count\n        period\n      }\n      requiresApproval\n      cancelUntilHours\n      feeCents\n      guests {\n        allowed\n        max\n        documentRequired\n      }\n      recurringAllowed\n    }\n  }\n": typeof types.SpaceFieldsFragmentDoc,
    "\n  query Spaces($includeInactive: Boolean!) {\n    spaces(includeInactive: $includeInactive) {\n      ...SpaceFields\n    }\n  }\n": typeof types.SpacesDocument,
    "\n  query Space($id: ID!) {\n    space(id: $id) {\n      ...SpaceFields\n    }\n  }\n": typeof types.SpaceDocument,
    "\n  mutation CreateSpace($input: SpaceInput!) {\n    createSpace(input: $input) {\n      ...SpaceFields\n    }\n  }\n": typeof types.CreateSpaceDocument,
    "\n  mutation UpdateSpace($id: ID!, $input: SpaceInput!) {\n    updateSpace(id: $id, input: $input) {\n      ...SpaceFields\n    }\n  }\n": typeof types.UpdateSpaceDocument,
    "\n  mutation SetSpaceActive($id: ID!, $active: Boolean!) {\n    setSpaceActive(id: $id, active: $active) {\n      ...SpaceFields\n    }\n  }\n": typeof types.SetSpaceActiveDocument,
    "\n  mutation AddSpacePhoto($spaceId: ID!, $photo: String!) {\n    addSpacePhoto(spaceId: $spaceId, photo: $photo) {\n      ...SpaceFields\n    }\n  }\n": typeof types.AddSpacePhotoDocument,
    "\n  mutation RemoveSpacePhoto($spaceId: ID!, $photoId: ID!) {\n    removeSpacePhoto(spaceId: $spaceId, photoId: $photoId) {\n      ...SpaceFields\n    }\n  }\n": typeof types.RemoveSpacePhotoDocument,
    "\n  mutation DeleteSpace($id: ID!) {\n    deleteSpace(id: $id)\n  }\n": typeof types.DeleteSpaceDocument,
    "\n  fragment SupportRequestFields on SupportRequest {\n    id\n    protocol\n    userId\n    userName\n    condominiumName\n    category\n    subject\n    message\n    status\n    reply\n    repliedAt\n    repliedByName\n    finalizedAt\n    finalizedByName\n    createdAt\n  }\n": typeof types.SupportRequestFieldsFragmentDoc,
    "\n  query SupportPage($page: PageInput) {\n    supportQuota {\n      limit\n      sentToday\n      remaining\n      nextAllowedAt\n    }\n    mySupportRequests(page: $page) {\n      items {\n        ...SupportRequestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.SupportPageDocument,
    "\n  query SupportRequests($status: SupportStatus, $page: PageInput) {\n    supportRequests(status: $status, page: $page) {\n      items {\n        ...SupportRequestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.SupportRequestsDocument,
    "\n  mutation SendSupportRequest($input: SupportRequestInput!) {\n    sendSupportRequest(input: $input) {\n      ...SupportRequestFields\n    }\n  }\n": typeof types.SendSupportRequestDocument,
    "\n  mutation ReplySupportRequest($id: ID!, $reply: String!) {\n    replySupportRequest(id: $id, reply: $reply) {\n      ...SupportRequestFields\n    }\n  }\n": typeof types.ReplySupportRequestDocument,
    "\n  mutation FinalizeSupportRequest($id: ID!) {\n    finalizeSupportRequest(id: $id) {\n      ...SupportRequestFields\n    }\n  }\n": typeof types.FinalizeSupportRequestDocument,
    "\n  query SupportRanking($year: Int) {\n    supportRanking(year: $year) {\n      year\n      supporters\n      totalCents\n      entries {\n        position\n        name\n        totalCents\n        contributions\n      }\n    }\n  }\n": typeof types.SupportRankingDocument,
    "\n  query Supporters {\n    supporters {\n      id\n      name\n      showName\n      totalCents\n      contributions\n      lastReceivedOn\n      history {\n        id\n        amountCents\n        receivedOn\n        note\n      }\n    }\n  }\n": typeof types.SupportersDocument,
    "\n  mutation RecordSupportContribution($input: RecordSupportContributionInput!) {\n    recordSupportContribution(input: $input) {\n      id\n    }\n  }\n": typeof types.RecordSupportContributionDocument,
    "\n  mutation UpdateSupporter($id: ID!, $input: UpdateSupporterInput!) {\n    updateSupporter(id: $id, input: $input) {\n      id\n    }\n  }\n": typeof types.UpdateSupporterDocument,
    "\n  mutation DeleteSupporter($id: ID!) {\n    deleteSupporter(id: $id)\n  }\n": typeof types.DeleteSupporterDocument,
    "\n  mutation DeleteSupportContribution($id: ID!) {\n    deleteSupportContribution(id: $id)\n  }\n": typeof types.DeleteSupportContributionDocument,
    "\n  query SystemLogs($filter: SystemLogFilterInput, $page: PageInput) {\n    systemLogs(filter: $filter, page: $page) {\n      items {\n        id\n        level\n        category\n        source\n        message\n        details\n        userId\n        userName\n        ip\n        statusCode\n        durationMs\n        environment\n        createdAt\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": typeof types.SystemLogsDocument,
    "\n  query SystemLogSummary {\n    systemLogSummary {\n      level\n      last24h\n      last7d\n    }\n  }\n": typeof types.SystemLogSummaryDocument,
    "\n  mutation ReportClientError(\n    $message: String!\n    $url: String!\n    $digest: String\n  ) {\n    reportClientError(message: $message, url: $url, digest: $digest)\n  }\n": typeof types.ReportClientErrorDocument,
};
const documents: Documents = {
    "\n  query Users($filter: UserFilterInput, $page: PageInput) {\n    users(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...UserAccountFields\n      }\n    }\n  }\n": types.UsersDocument,
    "\n  fragment UserAccountFields on UserAccount {\n    id\n    name\n    email\n    username\n    group\n    active\n    kind\n    unitId\n    unitLabel\n    unitComplement\n    employee {\n      jobTitle\n      hiredOn\n      workShift\n      contractor\n    }\n    phone\n    birthDate\n    photoUrl\n    sharedAccount\n    mustChangePassword\n    lockedUntil\n    locked\n    lastLoginAt\n    deactivatedAt\n    createdAt\n  }\n": types.UserAccountFieldsFragmentDoc,
    "\n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserAccountFields\n    }\n  }\n": types.UserDocument,
    "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      temporaryPassword\n      emailSent\n      existingAccount\n      user {\n        ...UserAccountFields\n      }\n    }\n  }\n": types.CreateUserDocument,
    "\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserAccountFields\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation SetUserActive($id: ID!, $active: Boolean!) {\n    setUserActive(id: $id, active: $active) {\n      ...UserAccountFields\n    }\n  }\n": types.SetUserActiveDocument,
    "\n  mutation ResetUserPassword($id: ID!) {\n    resetUserPassword(id: $id) {\n      temporaryPassword\n      emailSent\n      user {\n        ...UserAccountFields\n      }\n    }\n  }\n": types.ResetUserPasswordDocument,
    "\n  mutation UnlockUser($id: ID!) {\n    unlockUser(id: $id) {\n      ...UserAccountFields\n    }\n  }\n": types.UnlockUserDocument,
    "\n  mutation RevokeUserSessions($id: ID!) {\n    revokeUserSessions(id: $id) {\n      ...UserAccountFields\n    }\n  }\n": types.RevokeUserSessionsDocument,
    "\n  query UserPermissions($id: ID!) {\n    userPermissions(id: $id) {\n      effective\n      defaults\n      overrides {\n        permission\n        allowed\n      }\n    }\n  }\n": types.UserPermissionsDocument,
    "\n  mutation SetUserPermissions($input: SetUserPermissionsInput!) {\n    setUserPermissions(input: $input) {\n      effective\n      defaults\n      overrides {\n        permission\n        allowed\n      }\n    }\n  }\n": types.SetUserPermissionsDocument,
    "\n  query RecordStamp($entity: String!, $id: ID!) {\n    recordStamp(entity: $entity, id: $id) {\n      createdAt\n      createdByName\n      updatedAt\n      updatedByName\n    }\n  }\n": types.RecordStampDocument,
    "\n  query AppInfo {\n    appInfo {\n      version\n      commit\n      deployedAt\n    }\n  }\n": types.AppInfoDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      accessTokenExpiresAt\n      refreshToken\n      refreshTokenExpiresAt\n      user {\n        id\n        name\n        username\n        email\n        group\n        mustChangePassword\n        permissions\n        photoUrl\n        phone\n        birthDate\n        onboardingCompleted\n        platformAdmin\n        member\n        condominium {\n          id\n          name\n          city\n          state\n          status\n          addressFormat\n          modules\n        }\n        condominiums {\n          id\n          name\n          city\n          state\n          role\n        }\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation RefreshSession($refreshToken: String!) {\n    refreshSessionTokens(refreshToken: $refreshToken) {\n      accessToken\n      accessTokenExpiresAt\n      refreshToken\n      refreshTokenExpiresAt\n    }\n  }\n": types.RefreshSessionDocument,
    "\n  mutation Logout {\n    logout\n  }\n": types.LogoutDocument,
    "\n  query Me {\n    me {\n      id\n      name\n      username\n      email\n      group\n      mustChangePassword\n      permissions\n      photoUrl\n      phone\n      birthDate\n      onboardingCompleted\n      platformAdmin\n      member\n      condominium {\n        id\n        name\n        city\n        state\n        status\n        addressFormat\n        modules\n      }\n      condominiums {\n        id\n        name\n        city\n        state\n        role\n      }\n    }\n  }\n": types.MeDocument,
    "\n  mutation CompleteOnboarding {\n    completeOnboarding\n  }\n": types.CompleteOnboardingDocument,
    "\n  mutation ChangeMyPassword($input: ChangePasswordInput!) {\n    changeMyPassword(input: $input)\n  }\n": types.ChangeMyPasswordDocument,
    "\n  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      name\n      username\n      email\n      group\n      mustChangePassword\n      permissions\n      photoUrl\n      phone\n      birthDate\n      onboardingCompleted\n      platformAdmin\n      member\n      condominium {\n        id\n        name\n        city\n        state\n        status\n        addressFormat\n        modules\n      }\n      condominiums {\n        id\n        name\n        city\n        state\n        role\n      }\n    }\n  }\n": types.UpdateMyProfileDocument,
    "\n  mutation SetMyPhoto($photo: String!) {\n    setMyPhoto(photo: $photo)\n  }\n": types.SetMyPhotoDocument,
    "\n  mutation RemoveMyPhoto {\n    removeMyPhoto\n  }\n": types.RemoveMyPhotoDocument,
    "\n  mutation RequestPasswordRecovery($login: String!) {\n    requestPasswordRecovery(login: $login)\n  }\n": types.RequestPasswordRecoveryDocument,
    "\n  mutation VerifyPasswordRecoveryCode($input: VerifyRecoveryCodeInput!) {\n    verifyPasswordRecoveryCode(input: $input)\n  }\n": types.VerifyPasswordRecoveryCodeDocument,
    "\n  mutation ResetPasswordWithRecovery($input: ResetPasswordInput!) {\n    resetPasswordWithRecovery(input: $input)\n  }\n": types.ResetPasswordWithRecoveryDocument,
    "\n  mutation SwitchCondominium($condominiumId: ID) {\n    switchCondominium(condominiumId: $condominiumId)\n  }\n": types.SwitchCondominiumDocument,
    "\n  fragment BookingFields on Booking {\n    id\n    spaceId\n    spaceName\n    spaceKind\n    guestsAllowed\n    userId\n    userName\n    unitLabel\n    startsAt\n    endsAt\n    status\n    notes\n    cancelUntil\n    reason\n    decidedAt\n    cancelledAt\n    cancelledByManager\n    feeCents\n    feeBilledAt\n    seriesId\n    createdAt\n  }\n": types.BookingFieldsFragmentDoc,
    "\n  query MyBookings($when: BookingWhen!, $page: PageInput) {\n    myBookings(when: $when, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...BookingFields\n      }\n    }\n  }\n": types.MyBookingsDocument,
    "\n  query Bookings($filter: BookingFilterInput, $page: PageInput) {\n    bookings(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...BookingFields\n      }\n    }\n  }\n": types.BookingsDocument,
    "\n  query SpaceAvailability($spaceId: ID!, $date: String!) {\n    spaceAvailability(spaceId: $spaceId, date: $date) {\n      spaceId\n      date\n      firstDate\n      lastDate\n      slots {\n        startsAt\n        endsAt\n        state\n        bookingId\n        bookingStatus\n        label\n        waitlisted\n      }\n    }\n  }\n": types.SpaceAvailabilityDocument,
    "\n  mutation CreateBooking($input: CreateBookingInput!) {\n    createBooking(input: $input) {\n      ...BookingFields\n    }\n  }\n": types.CreateBookingDocument,
    "\n  mutation CancelBooking($id: ID!, $reason: String) {\n    cancelBooking(id: $id, reason: $reason) {\n      ...BookingFields\n    }\n  }\n": types.CancelBookingDocument,
    "\n  mutation ApproveBooking($id: ID!) {\n    approveBooking(id: $id) {\n      ...BookingFields\n    }\n  }\n": types.ApproveBookingDocument,
    "\n  mutation RejectBooking($id: ID!, $reason: String!) {\n    rejectBooking(id: $id, reason: $reason) {\n      ...BookingFields\n    }\n  }\n": types.RejectBookingDocument,
    "\n  query CondominiumSpaceBlocks {\n    condominiumSpaceBlocks {\n      id\n      spaceId\n      startsAt\n      endsAt\n      reason\n      createdByName\n      createdAt\n    }\n  }\n": types.CondominiumSpaceBlocksDocument,
    "\n  query SpaceBlocks($spaceId: ID!) {\n    spaceBlocks(spaceId: $spaceId) {\n      id\n      spaceId\n      startsAt\n      endsAt\n      reason\n      createdByName\n      createdAt\n    }\n  }\n": types.SpaceBlocksDocument,
    "\n  mutation CreateSpaceBlock($input: CreateSpaceBlockInput!) {\n    createSpaceBlock(input: $input) {\n      id\n    }\n  }\n": types.CreateSpaceBlockDocument,
    "\n  mutation DeleteSpaceBlock($id: ID!) {\n    deleteSpaceBlock(id: $id)\n  }\n": types.DeleteSpaceBlockDocument,
    "\n  mutation CreateBookingSeries($input: CreateBookingSeriesInput!) {\n    createBookingSeries(input: $input) {\n      seriesId\n      created {\n        ...BookingFields\n      }\n      skipped {\n        startsAt\n        reason\n      }\n    }\n  }\n": types.CreateBookingSeriesDocument,
    "\n  mutation CancelBookingSeries($seriesId: ID!) {\n    cancelBookingSeries(seriesId: $seriesId) {\n      cancelled\n      kept\n    }\n  }\n": types.CancelBookingSeriesDocument,
    "\n  mutation JoinWaitlist($input: WaitlistSlotInput!) {\n    joinWaitlist(input: $input)\n  }\n": types.JoinWaitlistDocument,
    "\n  mutation LeaveWaitlist($input: WaitlistSlotInput!) {\n    leaveWaitlist(input: $input)\n  }\n": types.LeaveWaitlistDocument,
    "\n  fragment BookingGuestFields on BookingGuest {\n    id\n    bookingId\n    name\n    documentType\n    document\n    phone\n    code\n    checkedInAt\n    createdAt\n  }\n": types.BookingGuestFieldsFragmentDoc,
    "\n  query BookingGuests($bookingId: ID!) {\n    bookingGuests(bookingId: $bookingId) {\n      ...BookingGuestFields\n    }\n  }\n": types.BookingGuestsDocument,
    "\n  mutation AddBookingGuests($input: AddBookingGuestsInput!) {\n    addBookingGuests(input: $input) {\n      ...BookingGuestFields\n    }\n  }\n": types.AddBookingGuestsDocument,
    "\n  mutation RemoveBookingGuest($id: ID!) {\n    removeBookingGuest(id: $id)\n  }\n": types.RemoveBookingGuestDocument,
    "\n  query GuestInvite($code: String!) {\n    guestInvite(code: $code) {\n      code\n      guestName\n      hostFirstName\n      spaceName\n      condominiumName\n      startsAt\n      endsAt\n      status\n      checkedIn\n    }\n  }\n": types.GuestInviteDocument,
    "\n  fragment GateGuestFields on GateGuest {\n    id\n    bookingId\n    name\n    documentType\n    document\n    phone\n    code\n    checkedInAt\n    spaceName\n    startsAt\n    endsAt\n    hostName\n    unitLabel\n    checkInWindow\n  }\n": types.GateGuestFieldsFragmentDoc,
    "\n  query GateGuests($date: String) {\n    gateGuests(date: $date) {\n      ...GateGuestFields\n    }\n  }\n": types.GateGuestsDocument,
    "\n  query DayGuests(\n    $date: String\n    $filter: DayGuestFilterInput\n    $page: PageInput\n  ) {\n    dayGuests(date: $date, filter: $filter, page: $page) {\n      items {\n        ...GateGuestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.DayGuestsDocument,
    "\n  query DayGuestsOverview($date: String) {\n    dayGuestsOverview(date: $date) {\n      total\n      checkedIn\n      bookings\n      guests {\n        id\n        label\n      }\n      hosts {\n        id\n        label\n      }\n      units {\n        id\n        label\n      }\n      spaces {\n        id\n        label\n      }\n    }\n  }\n": types.DayGuestsOverviewDocument,
    "\n  mutation CheckInGuest($input: CheckInGuestInput!) {\n    checkInGuest(input: $input) {\n      ...GateGuestFields\n    }\n  }\n": types.CheckInGuestDocument,
    "\n  mutation UndoGuestCheckIn($guestId: ID!) {\n    undoGuestCheckIn(guestId: $guestId) {\n      ...GateGuestFields\n    }\n  }\n": types.UndoGuestCheckInDocument,
    "\n  query BookingFees($month: String, $filter: FeeFilterInput) {\n    bookingFees(month: $month, filter: $filter) {\n      month\n      totalCents\n      billedCents\n      items {\n        ...BookingFields\n      }\n    }\n  }\n": types.BookingFeesDocument,
    "\n  query BookingFeesPage(\n    $month: String\n    $filter: FeeFilterInput\n    $page: PageInput\n  ) {\n    bookingFeesPage(month: $month, filter: $filter, page: $page) {\n      items {\n        ...BookingFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.BookingFeesPageDocument,
    "\n  query BookingFeesOverview($month: String) {\n    bookingFeesOverview(month: $month) {\n      month\n      count\n      totalCents\n      billedCents\n      units {\n        id\n        label\n      }\n      spaces {\n        id\n        label\n      }\n      users {\n        id\n        label\n      }\n    }\n  }\n": types.BookingFeesOverviewDocument,
    "\n  mutation SetBookingFeesBilled($input: SetBookingFeesBilledInput!) {\n    setBookingFeesBilled(input: $input)\n  }\n": types.SetBookingFeesBilledDocument,
    "\n  fragment BroadcastFields on Broadcast {\n    id\n    title\n    body\n    audience\n    targetGroup\n    sendEmail\n    recipients\n    authorName\n    createdAt\n  }\n": types.BroadcastFieldsFragmentDoc,
    "\n  query Broadcasts {\n    broadcasts {\n      ...BroadcastFields\n    }\n  }\n": types.BroadcastsDocument,
    "\n  mutation SendBroadcast($input: BroadcastInput!) {\n    sendBroadcast(input: $input) {\n      ...BroadcastFields\n    }\n  }\n": types.SendBroadcastDocument,
    "\n  fragment CondominiumFields on Condominium {\n    id\n    name\n    document\n    city\n    state\n    status\n    addressFormat\n    modules\n    activeMembers\n    managers\n    units\n    pendingEnrollments\n    lastActivityAt\n    createdAt\n  }\n": types.CondominiumFieldsFragmentDoc,
    "\n  query Condominiums($filter: CondominiumFilterInput) {\n    condominiums(filter: $filter) {\n      ...CondominiumFields\n    }\n  }\n": types.CondominiumsDocument,
    "\n  mutation CreateCondominium($input: CondominiumInput!) {\n    createCondominium(input: $input) {\n      ...CondominiumFields\n    }\n  }\n": types.CreateCondominiumDocument,
    "\n  mutation UpdateCondominium($id: ID!, $input: CondominiumInput!) {\n    updateCondominium(id: $id, input: $input) {\n      ...CondominiumFields\n    }\n  }\n": types.UpdateCondominiumDocument,
    "\n  mutation SetCondominiumStatus($id: ID!, $status: CondominiumStatus!) {\n    setCondominiumStatus(id: $id, status: $status) {\n      ...CondominiumFields\n    }\n  }\n": types.SetCondominiumStatusDocument,
    "\n  mutation SetCondominiumModule(\n    $id: ID!\n    $module: AppModule!\n    $enabled: Boolean!\n  ) {\n    setCondominiumModule(id: $id, module: $module, enabled: $enabled) {\n      ...CondominiumFields\n    }\n  }\n": types.SetCondominiumModuleDocument,
    "\n  fragment UnitFields on Unit {\n    id\n    street\n    block\n    number\n    label\n    residents\n  }\n": types.UnitFieldsFragmentDoc,
    "\n  query Units {\n    units {\n      ...UnitFields\n    }\n  }\n": types.UnitsDocument,
    "\n  mutation CreateUnits($input: CreateUnitsInput!) {\n    createUnits(input: $input) {\n      ...UnitFields\n    }\n  }\n": types.CreateUnitsDocument,
    "\n  mutation UpdateUnit($id: ID!, $input: UpdateUnitInput!) {\n    updateUnit(id: $id, input: $input) {\n      ...UnitFields\n    }\n  }\n": types.UpdateUnitDocument,
    "\n  mutation DeleteUnit($id: ID!) {\n    deleteUnit(id: $id)\n  }\n": types.DeleteUnitDocument,
    "\n  query Condominium($id: ID!) {\n    condominium(id: $id) {\n      ...CondominiumFields\n    }\n  }\n": types.CondominiumDocument,
    "\n  query Dashboard {\n    dashboard {\n      activeUsers\n      pendingEnrollments\n      units\n      activeSpaces\n      pendingBookings\n      bookingsToday\n      openSupportRequests\n      failedNotifications\n    }\n  }\n": types.DashboardDocument,
    "\n  fragment DependentFields on Dependent {\n    id\n    name\n    birthDate\n    relationship\n    status\n    holderName\n    unitLabel\n    rejectReason\n    reviewedAt\n    createdAt\n    documentUrl\n    documentContentType\n  }\n": types.DependentFieldsFragmentDoc,
    "\n  query MyDependents {\n    myDependents {\n      ...DependentFields\n    }\n  }\n": types.MyDependentsDocument,
    "\n  mutation AddDependent($input: DependentInput!) {\n    addDependent(input: $input) {\n      ...DependentFields\n    }\n  }\n": types.AddDependentDocument,
    "\n  mutation RemoveDependent($id: ID!) {\n    removeDependent(id: $id)\n  }\n": types.RemoveDependentDocument,
    "\n  query Dependents($status: DependentStatus) {\n    dependents(status: $status) {\n      ...DependentFields\n    }\n  }\n": types.DependentsDocument,
    "\n  mutation ApproveDependent($id: ID!) {\n    approveDependent(id: $id) {\n      ...DependentFields\n    }\n  }\n": types.ApproveDependentDocument,
    "\n  mutation RejectDependent($id: ID!, $reason: String!) {\n    rejectDependent(id: $id, reason: $reason) {\n      ...DependentFields\n    }\n  }\n": types.RejectDependentDocument,
    "\n  mutation VerifyEnrollmentCode($code: String!) {\n    verifyEnrollmentCode(code: $code)\n  }\n": types.VerifyEnrollmentCodeDocument,
    "\n  query EnrollmentForm($formToken: String!) {\n    enrollmentForm(formToken: $formToken) {\n      condominiumName\n      addressFormat\n      units {\n        id\n        label\n      }\n    }\n  }\n": types.EnrollmentFormDocument,
    "\n  mutation SubmitEnrollment($input: SubmitEnrollmentInput!) {\n    submitEnrollment(input: $input)\n  }\n": types.SubmitEnrollmentDocument,
    "\n  fragment EnrollmentInviteFields on EnrollmentInvite {\n    id\n    code\n    label\n    expiresAt\n    revokedAt\n    createdAt\n    requestCount\n  }\n": types.EnrollmentInviteFieldsFragmentDoc,
    "\n  fragment EnrollmentRequestFields on EnrollmentRequest {\n    id\n    status\n    applicant\n    fullName\n    email\n    phone\n    birthDate\n    unitId\n    unitLabel\n    unitComplement\n    typedUnitLabel\n    typedUnitBlock\n    typedUnitNumber\n    typedUnitStreet\n    createdAt\n    reviewedAt\n    rejectionReason\n    userId\n    photoUrl\n  }\n": types.EnrollmentRequestFieldsFragmentDoc,
    "\n  query EnrollmentInvites {\n    enrollmentInvites {\n      ...EnrollmentInviteFields\n    }\n  }\n": types.EnrollmentInvitesDocument,
    "\n  mutation CreateEnrollmentInvite($input: CreateEnrollmentInviteInput!) {\n    createEnrollmentInvite(input: $input) {\n      ...EnrollmentInviteFields\n    }\n  }\n": types.CreateEnrollmentInviteDocument,
    "\n  mutation RevokeEnrollmentInvite($id: ID!) {\n    revokeEnrollmentInvite(id: $id) {\n      ...EnrollmentInviteFields\n    }\n  }\n": types.RevokeEnrollmentInviteDocument,
    "\n  query EnrollmentRequests(\n    $filter: EnrollmentRequestFilterInput\n    $page: PageInput\n  ) {\n    enrollmentRequests(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...EnrollmentRequestFields\n      }\n    }\n    pendingEnrollmentCount\n  }\n": types.EnrollmentRequestsDocument,
    "\n  mutation ApproveEnrollmentRequest(\n    $id: ID!\n    $data: EnrollmentDataInput!\n    $group: UserGroup!\n  ) {\n    approveEnrollmentRequest(id: $id, data: $data, group: $group) {\n      request {\n        ...EnrollmentRequestFields\n      }\n      access {\n        temporaryPassword\n        emailSent\n        existingAccount\n        user {\n          ...UserAccountFields\n        }\n      }\n    }\n  }\n": types.ApproveEnrollmentRequestDocument,
    "\n  mutation RejectEnrollmentRequest($id: ID!, $reason: String!) {\n    rejectEnrollmentRequest(id: $id, reason: $reason) {\n      ...EnrollmentRequestFields\n    }\n  }\n": types.RejectEnrollmentRequestDocument,
    "\n  fragment EventFields on Event {\n    id\n    title\n    description\n    spaceId\n    spaceName\n    location\n    address {\n      zip\n      street\n      number\n      complement\n      district\n      city\n      state\n    }\n    startsAt\n    endsAt\n    capacity\n    externalGuestLimit\n    ticketed\n    fullPriceCents\n    ticketTypes {\n      id\n      kind\n      name\n      priceMode\n      customPriceCents\n      priceCents\n      minAge\n      maxAge\n    }\n    unitTicketLimit\n    salesClose\n    salesCloseHours\n    salesClosesAt\n    pixSource\n    customPix {\n      keyType\n      key\n      name\n      city\n    }\n    placesLeft\n    outsidePlacesLeft\n    status\n    cancelReason\n    publishedAt\n    cancelledAt\n    createdAt\n  }\n": types.EventFieldsFragmentDoc,
    "\n  query Events($when: EventWhen) {\n    events(when: $when) {\n      ...EventFields\n    }\n  }\n": types.EventsDocument,
    "\n  query Event($id: ID!) {\n    event(id: $id) {\n      ...EventFields\n    }\n  }\n": types.EventDocument,
    "\n  mutation CreateEvent($input: EventInput!) {\n    createEvent(input: $input) {\n      ...EventFields\n    }\n  }\n": types.CreateEventDocument,
    "\n  mutation UpdateEvent($id: ID!, $input: EventInput!) {\n    updateEvent(id: $id, input: $input) {\n      ...EventFields\n    }\n  }\n": types.UpdateEventDocument,
    "\n  mutation PublishEvent($id: ID!) {\n    publishEvent(id: $id) {\n      ...EventFields\n    }\n  }\n": types.PublishEventDocument,
    "\n  mutation CancelEvent($id: ID!, $reason: String!) {\n    cancelEvent(id: $id, reason: $reason) {\n      ...EventFields\n    }\n  }\n": types.CancelEventDocument,
    "\n  fragment EventOrderFields on EventOrder {\n    id\n    eventId\n    eventTitle\n    code\n    status\n    totalCents\n    buyerId\n    buyerName\n    unitId\n    unitLabel\n    attendees {\n      id\n      source\n      dependentId\n      name\n      age\n      outside\n      ticketName\n      priceCents\n      needsProof\n      proofUrl\n      proofContentType\n      ticketCode\n      checkedInAt\n    }\n    pix {\n      keyType\n      key\n      name\n      city\n    }\n    pixCode\n    expiresAt\n    receiptSentAt\n    receiptContentType\n    receiptUrl\n    reviewedAt\n    rejectReason\n    cancelledAt\n    createdAt\n  }\n": types.EventOrderFieldsFragmentDoc,
    "\n  query MyEventOrders($eventId: ID!) {\n    myEventOrders(eventId: $eventId) {\n      ...EventOrderFields\n    }\n  }\n": types.MyEventOrdersDocument,
    "\n  query EventOrders(\n    $eventId: ID!\n    $filter: EventOrderFilterInput\n    $page: PageInput\n  ) {\n    eventOrders(eventId: $eventId, filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...EventOrderFields\n      }\n    }\n  }\n": types.EventOrdersDocument,
    "\n  mutation CreateEventOrder($eventId: ID!, $attendees: [AttendeeInput!]!) {\n    createEventOrder(eventId: $eventId, attendees: $attendees) {\n      ...EventOrderFields\n    }\n  }\n": types.CreateEventOrderDocument,
    "\n  mutation SubmitEventOrderReceipt($id: ID!, $file: String!) {\n    submitEventOrderReceipt(id: $id, file: $file) {\n      ...EventOrderFields\n    }\n  }\n": types.SubmitEventOrderReceiptDocument,
    "\n  mutation CancelEventOrder($id: ID!) {\n    cancelEventOrder(id: $id) {\n      ...EventOrderFields\n    }\n  }\n": types.CancelEventOrderDocument,
    "\n  mutation ApproveEventOrder($id: ID!) {\n    approveEventOrder(id: $id) {\n      ...EventOrderFields\n    }\n  }\n": types.ApproveEventOrderDocument,
    "\n  mutation RejectEventOrder($id: ID!, $reason: String!) {\n    rejectEventOrder(id: $id, reason: $reason) {\n      ...EventOrderFields\n    }\n  }\n": types.RejectEventOrderDocument,
    "\n  mutation SubmitEventAttendeeProof(\n    $orderId: ID!\n    $attendeeId: ID!\n    $file: String!\n  ) {\n    submitEventAttendeeProof(\n      orderId: $orderId\n      attendeeId: $attendeeId\n      file: $file\n    ) {\n      ...EventOrderFields\n    }\n  }\n": types.SubmitEventAttendeeProofDocument,
    "\n  fragment GateEventTicketFields on GateEventTicket {\n    id\n    name\n    age\n    outside\n    source\n    ticketName\n    ticketCode\n    checkedInAt\n    entryWindow\n    eventId\n    eventTitle\n    eventStatus\n    startsAt\n    endsAt\n    placeName\n    orderCode\n    buyerName\n    unitId\n    unitLabel\n  }\n": types.GateEventTicketFieldsFragmentDoc,
    "\n  query GateEventTickets($date: String) {\n    gateEventTickets(date: $date) {\n      ...GateEventTicketFields\n    }\n  }\n": types.GateEventTicketsDocument,
    "\n  mutation CheckInEventTicket($input: CheckInEventTicketInput!) {\n    checkInEventTicket(input: $input) {\n      ...GateEventTicketFields\n    }\n  }\n": types.CheckInEventTicketDocument,
    "\n  mutation UndoEventTicketCheckIn($attendeeId: ID!) {\n    undoEventTicketCheckIn(attendeeId: $attendeeId) {\n      ...GateEventTicketFields\n    }\n  }\n": types.UndoEventTicketCheckInDocument,
    "\n  query EventTicketPass($code: String!) {\n    eventTicket(code: $code) {\n      code\n      name\n      ticketName\n      eventTitle\n      placeName\n      condominiumName\n      startsAt\n      endsAt\n      buyerFirstName\n      status\n      checkedIn\n    }\n  }\n": types.EventTicketPassDocument,
    "\n  query EventOrdersQueue($status: EventOrderStatus, $eventId: ID) {\n    eventOrdersQueue(status: $status, eventId: $eventId) {\n      ...EventOrderFields\n    }\n  }\n": types.EventOrdersQueueDocument,
    "\n  query EventTickets(\n    $eventId: ID!\n    $filter: EventTicketFilterInput\n    $page: PageInput\n  ) {\n    eventTickets(eventId: $eventId, filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...GateEventTicketFields\n      }\n    }\n  }\n": types.EventTicketsDocument,
    "\n  query EventTicketOverview($eventId: ID!) {\n    eventTicketOverview(eventId: $eventId) {\n      total\n      checkedIn\n      outside\n      byType {\n        name\n        count\n      }\n      people {\n        id\n        name\n        ticketCode\n      }\n      units {\n        id\n        label\n      }\n    }\n  }\n": types.EventTicketOverviewDocument,
    "\n  query EventOrderOverview($eventId: ID!) {\n    eventOrderOverview(eventId: $eventId) {\n      byStatus {\n        status\n        count\n      }\n      receivedCents\n      confirmedPeople\n      buyers {\n        id\n        name\n      }\n      units {\n        id\n        label\n      }\n      codes {\n        code\n        buyerName\n      }\n    }\n  }\n": types.EventOrderOverviewDocument,
    "\n  query MyNotifications($unreadOnly: Boolean!, $page: PageInput) {\n    myNotifications(unreadOnly: $unreadOnly, page: $page) {\n      items {\n        id\n        type\n        title\n        body\n        link\n        readAt\n        createdAt\n      }\n      total\n      page\n      totalPages\n    }\n  }\n": types.MyNotificationsDocument,
    "\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n": types.UnreadNotificationsCountDocument,
    "\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n": types.MarkNotificationReadDocument,
    "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n": types.MarkAllNotificationsReadDocument,
    "\n  query NotificationPreferences {\n    myNotificationPreferences {\n      type\n      emailEnabled\n    }\n  }\n": types.NotificationPreferencesDocument,
    "\n  mutation SetNotificationPreference(\n    $type: NotificationType!\n    $emailEnabled: Boolean!\n  ) {\n    setNotificationPreference(type: $type, emailEnabled: $emailEnabled) {\n      type\n      emailEnabled\n    }\n  }\n": types.SetNotificationPreferenceDocument,
    "\n  query PushPublicKey {\n    pushPublicKey\n  }\n": types.PushPublicKeyDocument,
    "\n  mutation SubscribePush($input: PushSubscriptionInput!) {\n    subscribePush(input: $input)\n  }\n": types.SubscribePushDocument,
    "\n  mutation UnsubscribePush($endpoint: String!) {\n    unsubscribePush(endpoint: $endpoint)\n  }\n": types.UnsubscribePushDocument,
    "\n  mutation SendTestPush {\n    sendTestPush\n  }\n": types.SendTestPushDocument,
    "\n  query CondominiumPix {\n    condominiumPix {\n      keyType\n      key\n      name\n      city\n    }\n  }\n": types.CondominiumPixDocument,
    "\n  mutation SetCondominiumPix($input: PixReceiverInput!) {\n    setCondominiumPix(input: $input) {\n      keyType\n      key\n      name\n      city\n    }\n  }\n": types.SetCondominiumPixDocument,
    "\n  mutation RemoveCondominiumPix {\n    removeCondominiumPix\n  }\n": types.RemoveCondominiumPixDocument,
    "\n  query PlatformMetrics($filter: PlatformMetricsFilterInput) {\n    platformMetrics(filter: $filter) {\n      from\n      to\n      days\n      condominiumId\n      bookings {\n        total\n        confirmed\n        pending\n        cancelled\n        rejected\n        stalePending\n        granularity\n        series {\n          bucket\n          total\n          cancelled\n        }\n        byCondominium {\n          condominiumId\n          name\n          total\n          cancelled\n        }\n      }\n      spaces {\n        activeSpaces\n        unusedCount\n        mostUsed {\n          spaceId\n          name\n          condominiumName\n          bookings\n          hours\n        }\n        unused {\n          spaceId\n          name\n          condominiumName\n          bookings\n          hours\n        }\n        byWeekday {\n          weekday\n          bookings\n        }\n        byHour {\n          hour\n          bookings\n        }\n      }\n      engagement {\n        members\n        active7d\n        active30d\n        newMembers\n        enrollments\n        inactiveCount\n        inactiveCondominiums {\n          condominiumId\n          name\n          lastActivityAt\n        }\n      }\n      health {\n        staleEnrollments\n        failedNotifications\n        delayedNotifications\n        withoutManager\n        withoutUnits\n        openSupport\n      }\n    }\n  }\n": types.PlatformMetricsDocument,
    "\n  query PlatformPeople($filter: PlatformPeopleFilterInput, $page: PageInput) {\n    platformPeople(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        id\n        name\n        email\n        username\n        phone\n        platformAdmin\n        active\n        lockedUntil\n        lastLoginAt\n        createdAt\n        memberships {\n          condominiumId\n          condominiumName\n          role\n          kind\n          active\n        }\n      }\n    }\n  }\n": types.PlatformPeopleDocument,
    "\n  query CondominiumMembers($condominiumId: ID!) {\n    condominiumMembers(condominiumId: $condominiumId) {\n      userId\n      name\n      email\n      username\n      phone\n      role\n      kind\n      active\n      unitLabel\n      jobTitle\n      lastLoginAt\n      since\n    }\n  }\n": types.CondominiumMembersDocument,
    "\n  fragment SpaceFields on Space {\n    id\n    name\n    kind\n    description\n    capacity\n    usageRules\n    active\n    photos {\n      id\n      url\n    }\n    createdAt\n    updatedAt\n    rules {\n      openingHours {\n        weekday\n        opensAt\n        closesAt\n      }\n      slotMinutes\n      minAdvanceHours\n      maxAdvanceDays\n      unitLimit {\n        count\n        period\n      }\n      requiresApproval\n      cancelUntilHours\n      feeCents\n      guests {\n        allowed\n        max\n        documentRequired\n      }\n      recurringAllowed\n    }\n  }\n": types.SpaceFieldsFragmentDoc,
    "\n  query Spaces($includeInactive: Boolean!) {\n    spaces(includeInactive: $includeInactive) {\n      ...SpaceFields\n    }\n  }\n": types.SpacesDocument,
    "\n  query Space($id: ID!) {\n    space(id: $id) {\n      ...SpaceFields\n    }\n  }\n": types.SpaceDocument,
    "\n  mutation CreateSpace($input: SpaceInput!) {\n    createSpace(input: $input) {\n      ...SpaceFields\n    }\n  }\n": types.CreateSpaceDocument,
    "\n  mutation UpdateSpace($id: ID!, $input: SpaceInput!) {\n    updateSpace(id: $id, input: $input) {\n      ...SpaceFields\n    }\n  }\n": types.UpdateSpaceDocument,
    "\n  mutation SetSpaceActive($id: ID!, $active: Boolean!) {\n    setSpaceActive(id: $id, active: $active) {\n      ...SpaceFields\n    }\n  }\n": types.SetSpaceActiveDocument,
    "\n  mutation AddSpacePhoto($spaceId: ID!, $photo: String!) {\n    addSpacePhoto(spaceId: $spaceId, photo: $photo) {\n      ...SpaceFields\n    }\n  }\n": types.AddSpacePhotoDocument,
    "\n  mutation RemoveSpacePhoto($spaceId: ID!, $photoId: ID!) {\n    removeSpacePhoto(spaceId: $spaceId, photoId: $photoId) {\n      ...SpaceFields\n    }\n  }\n": types.RemoveSpacePhotoDocument,
    "\n  mutation DeleteSpace($id: ID!) {\n    deleteSpace(id: $id)\n  }\n": types.DeleteSpaceDocument,
    "\n  fragment SupportRequestFields on SupportRequest {\n    id\n    protocol\n    userId\n    userName\n    condominiumName\n    category\n    subject\n    message\n    status\n    reply\n    repliedAt\n    repliedByName\n    finalizedAt\n    finalizedByName\n    createdAt\n  }\n": types.SupportRequestFieldsFragmentDoc,
    "\n  query SupportPage($page: PageInput) {\n    supportQuota {\n      limit\n      sentToday\n      remaining\n      nextAllowedAt\n    }\n    mySupportRequests(page: $page) {\n      items {\n        ...SupportRequestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.SupportPageDocument,
    "\n  query SupportRequests($status: SupportStatus, $page: PageInput) {\n    supportRequests(status: $status, page: $page) {\n      items {\n        ...SupportRequestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.SupportRequestsDocument,
    "\n  mutation SendSupportRequest($input: SupportRequestInput!) {\n    sendSupportRequest(input: $input) {\n      ...SupportRequestFields\n    }\n  }\n": types.SendSupportRequestDocument,
    "\n  mutation ReplySupportRequest($id: ID!, $reply: String!) {\n    replySupportRequest(id: $id, reply: $reply) {\n      ...SupportRequestFields\n    }\n  }\n": types.ReplySupportRequestDocument,
    "\n  mutation FinalizeSupportRequest($id: ID!) {\n    finalizeSupportRequest(id: $id) {\n      ...SupportRequestFields\n    }\n  }\n": types.FinalizeSupportRequestDocument,
    "\n  query SupportRanking($year: Int) {\n    supportRanking(year: $year) {\n      year\n      supporters\n      totalCents\n      entries {\n        position\n        name\n        totalCents\n        contributions\n      }\n    }\n  }\n": types.SupportRankingDocument,
    "\n  query Supporters {\n    supporters {\n      id\n      name\n      showName\n      totalCents\n      contributions\n      lastReceivedOn\n      history {\n        id\n        amountCents\n        receivedOn\n        note\n      }\n    }\n  }\n": types.SupportersDocument,
    "\n  mutation RecordSupportContribution($input: RecordSupportContributionInput!) {\n    recordSupportContribution(input: $input) {\n      id\n    }\n  }\n": types.RecordSupportContributionDocument,
    "\n  mutation UpdateSupporter($id: ID!, $input: UpdateSupporterInput!) {\n    updateSupporter(id: $id, input: $input) {\n      id\n    }\n  }\n": types.UpdateSupporterDocument,
    "\n  mutation DeleteSupporter($id: ID!) {\n    deleteSupporter(id: $id)\n  }\n": types.DeleteSupporterDocument,
    "\n  mutation DeleteSupportContribution($id: ID!) {\n    deleteSupportContribution(id: $id)\n  }\n": types.DeleteSupportContributionDocument,
    "\n  query SystemLogs($filter: SystemLogFilterInput, $page: PageInput) {\n    systemLogs(filter: $filter, page: $page) {\n      items {\n        id\n        level\n        category\n        source\n        message\n        details\n        userId\n        userName\n        ip\n        statusCode\n        durationMs\n        environment\n        createdAt\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n": types.SystemLogsDocument,
    "\n  query SystemLogSummary {\n    systemLogSummary {\n      level\n      last24h\n      last7d\n    }\n  }\n": types.SystemLogSummaryDocument,
    "\n  mutation ReportClientError(\n    $message: String!\n    $url: String!\n    $digest: String\n  ) {\n    reportClientError(message: $message, url: $url, digest: $digest)\n  }\n": types.ReportClientErrorDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Users($filter: UserFilterInput, $page: PageInput) {\n    users(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...UserAccountFields\n      }\n    }\n  }\n"): typeof import('./graphql').UsersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UserAccountFields on UserAccount {\n    id\n    name\n    email\n    username\n    group\n    active\n    kind\n    unitId\n    unitLabel\n    unitComplement\n    employee {\n      jobTitle\n      hiredOn\n      workShift\n      contractor\n    }\n    phone\n    birthDate\n    photoUrl\n    sharedAccount\n    mustChangePassword\n    lockedUntil\n    locked\n    lastLoginAt\n    deactivatedAt\n    createdAt\n  }\n"): typeof import('./graphql').UserAccountFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query User($id: ID!) {\n    user(id: $id) {\n      ...UserAccountFields\n    }\n  }\n"): typeof import('./graphql').UserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUser($input: CreateUserInput!) {\n    createUser(input: $input) {\n      temporaryPassword\n      emailSent\n      existingAccount\n      user {\n        ...UserAccountFields\n      }\n    }\n  }\n"): typeof import('./graphql').CreateUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {\n    updateUser(id: $id, input: $input) {\n      ...UserAccountFields\n    }\n  }\n"): typeof import('./graphql').UpdateUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetUserActive($id: ID!, $active: Boolean!) {\n    setUserActive(id: $id, active: $active) {\n      ...UserAccountFields\n    }\n  }\n"): typeof import('./graphql').SetUserActiveDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetUserPassword($id: ID!) {\n    resetUserPassword(id: $id) {\n      temporaryPassword\n      emailSent\n      user {\n        ...UserAccountFields\n      }\n    }\n  }\n"): typeof import('./graphql').ResetUserPasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnlockUser($id: ID!) {\n    unlockUser(id: $id) {\n      ...UserAccountFields\n    }\n  }\n"): typeof import('./graphql').UnlockUserDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeUserSessions($id: ID!) {\n    revokeUserSessions(id: $id) {\n      ...UserAccountFields\n    }\n  }\n"): typeof import('./graphql').RevokeUserSessionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UserPermissions($id: ID!) {\n    userPermissions(id: $id) {\n      effective\n      defaults\n      overrides {\n        permission\n        allowed\n      }\n    }\n  }\n"): typeof import('./graphql').UserPermissionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetUserPermissions($input: SetUserPermissionsInput!) {\n    setUserPermissions(input: $input) {\n      effective\n      defaults\n      overrides {\n        permission\n        allowed\n      }\n    }\n  }\n"): typeof import('./graphql').SetUserPermissionsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RecordStamp($entity: String!, $id: ID!) {\n    recordStamp(entity: $entity, id: $id) {\n      createdAt\n      createdByName\n      updatedAt\n      updatedByName\n    }\n  }\n"): typeof import('./graphql').RecordStampDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AppInfo {\n    appInfo {\n      version\n      commit\n      deployedAt\n    }\n  }\n"): typeof import('./graphql').AppInfoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      accessTokenExpiresAt\n      refreshToken\n      refreshTokenExpiresAt\n      user {\n        id\n        name\n        username\n        email\n        group\n        mustChangePassword\n        permissions\n        photoUrl\n        phone\n        birthDate\n        onboardingCompleted\n        platformAdmin\n        member\n        condominium {\n          id\n          name\n          city\n          state\n          status\n          addressFormat\n          modules\n        }\n        condominiums {\n          id\n          name\n          city\n          state\n          role\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').LoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RefreshSession($refreshToken: String!) {\n    refreshSessionTokens(refreshToken: $refreshToken) {\n      accessToken\n      accessTokenExpiresAt\n      refreshToken\n      refreshTokenExpiresAt\n    }\n  }\n"): typeof import('./graphql').RefreshSessionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Logout {\n    logout\n  }\n"): typeof import('./graphql').LogoutDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Me {\n    me {\n      id\n      name\n      username\n      email\n      group\n      mustChangePassword\n      permissions\n      photoUrl\n      phone\n      birthDate\n      onboardingCompleted\n      platformAdmin\n      member\n      condominium {\n        id\n        name\n        city\n        state\n        status\n        addressFormat\n        modules\n      }\n      condominiums {\n        id\n        name\n        city\n        state\n        role\n      }\n    }\n  }\n"): typeof import('./graphql').MeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CompleteOnboarding {\n    completeOnboarding\n  }\n"): typeof import('./graphql').CompleteOnboardingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ChangeMyPassword($input: ChangePasswordInput!) {\n    changeMyPassword(input: $input)\n  }\n"): typeof import('./graphql').ChangeMyPasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {\n    updateMyProfile(input: $input) {\n      id\n      name\n      username\n      email\n      group\n      mustChangePassword\n      permissions\n      photoUrl\n      phone\n      birthDate\n      onboardingCompleted\n      platformAdmin\n      member\n      condominium {\n        id\n        name\n        city\n        state\n        status\n        addressFormat\n        modules\n      }\n      condominiums {\n        id\n        name\n        city\n        state\n        role\n      }\n    }\n  }\n"): typeof import('./graphql').UpdateMyProfileDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetMyPhoto($photo: String!) {\n    setMyPhoto(photo: $photo)\n  }\n"): typeof import('./graphql').SetMyPhotoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveMyPhoto {\n    removeMyPhoto\n  }\n"): typeof import('./graphql').RemoveMyPhotoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RequestPasswordRecovery($login: String!) {\n    requestPasswordRecovery(login: $login)\n  }\n"): typeof import('./graphql').RequestPasswordRecoveryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyPasswordRecoveryCode($input: VerifyRecoveryCodeInput!) {\n    verifyPasswordRecoveryCode(input: $input)\n  }\n"): typeof import('./graphql').VerifyPasswordRecoveryCodeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetPasswordWithRecovery($input: ResetPasswordInput!) {\n    resetPasswordWithRecovery(input: $input)\n  }\n"): typeof import('./graphql').ResetPasswordWithRecoveryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SwitchCondominium($condominiumId: ID) {\n    switchCondominium(condominiumId: $condominiumId)\n  }\n"): typeof import('./graphql').SwitchCondominiumDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BookingFields on Booking {\n    id\n    spaceId\n    spaceName\n    spaceKind\n    guestsAllowed\n    userId\n    userName\n    unitLabel\n    startsAt\n    endsAt\n    status\n    notes\n    cancelUntil\n    reason\n    decidedAt\n    cancelledAt\n    cancelledByManager\n    feeCents\n    feeBilledAt\n    seriesId\n    createdAt\n  }\n"): typeof import('./graphql').BookingFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyBookings($when: BookingWhen!, $page: PageInput) {\n    myBookings(when: $when, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...BookingFields\n      }\n    }\n  }\n"): typeof import('./graphql').MyBookingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Bookings($filter: BookingFilterInput, $page: PageInput) {\n    bookings(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...BookingFields\n      }\n    }\n  }\n"): typeof import('./graphql').BookingsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpaceAvailability($spaceId: ID!, $date: String!) {\n    spaceAvailability(spaceId: $spaceId, date: $date) {\n      spaceId\n      date\n      firstDate\n      lastDate\n      slots {\n        startsAt\n        endsAt\n        state\n        bookingId\n        bookingStatus\n        label\n        waitlisted\n      }\n    }\n  }\n"): typeof import('./graphql').SpaceAvailabilityDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateBooking($input: CreateBookingInput!) {\n    createBooking(input: $input) {\n      ...BookingFields\n    }\n  }\n"): typeof import('./graphql').CreateBookingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelBooking($id: ID!, $reason: String) {\n    cancelBooking(id: $id, reason: $reason) {\n      ...BookingFields\n    }\n  }\n"): typeof import('./graphql').CancelBookingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApproveBooking($id: ID!) {\n    approveBooking(id: $id) {\n      ...BookingFields\n    }\n  }\n"): typeof import('./graphql').ApproveBookingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectBooking($id: ID!, $reason: String!) {\n    rejectBooking(id: $id, reason: $reason) {\n      ...BookingFields\n    }\n  }\n"): typeof import('./graphql').RejectBookingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CondominiumSpaceBlocks {\n    condominiumSpaceBlocks {\n      id\n      spaceId\n      startsAt\n      endsAt\n      reason\n      createdByName\n      createdAt\n    }\n  }\n"): typeof import('./graphql').CondominiumSpaceBlocksDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SpaceBlocks($spaceId: ID!) {\n    spaceBlocks(spaceId: $spaceId) {\n      id\n      spaceId\n      startsAt\n      endsAt\n      reason\n      createdByName\n      createdAt\n    }\n  }\n"): typeof import('./graphql').SpaceBlocksDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSpaceBlock($input: CreateSpaceBlockInput!) {\n    createSpaceBlock(input: $input) {\n      id\n    }\n  }\n"): typeof import('./graphql').CreateSpaceBlockDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteSpaceBlock($id: ID!) {\n    deleteSpaceBlock(id: $id)\n  }\n"): typeof import('./graphql').DeleteSpaceBlockDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateBookingSeries($input: CreateBookingSeriesInput!) {\n    createBookingSeries(input: $input) {\n      seriesId\n      created {\n        ...BookingFields\n      }\n      skipped {\n        startsAt\n        reason\n      }\n    }\n  }\n"): typeof import('./graphql').CreateBookingSeriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelBookingSeries($seriesId: ID!) {\n    cancelBookingSeries(seriesId: $seriesId) {\n      cancelled\n      kept\n    }\n  }\n"): typeof import('./graphql').CancelBookingSeriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation JoinWaitlist($input: WaitlistSlotInput!) {\n    joinWaitlist(input: $input)\n  }\n"): typeof import('./graphql').JoinWaitlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation LeaveWaitlist($input: WaitlistSlotInput!) {\n    leaveWaitlist(input: $input)\n  }\n"): typeof import('./graphql').LeaveWaitlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BookingGuestFields on BookingGuest {\n    id\n    bookingId\n    name\n    documentType\n    document\n    phone\n    code\n    checkedInAt\n    createdAt\n  }\n"): typeof import('./graphql').BookingGuestFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BookingGuests($bookingId: ID!) {\n    bookingGuests(bookingId: $bookingId) {\n      ...BookingGuestFields\n    }\n  }\n"): typeof import('./graphql').BookingGuestsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddBookingGuests($input: AddBookingGuestsInput!) {\n    addBookingGuests(input: $input) {\n      ...BookingGuestFields\n    }\n  }\n"): typeof import('./graphql').AddBookingGuestsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveBookingGuest($id: ID!) {\n    removeBookingGuest(id: $id)\n  }\n"): typeof import('./graphql').RemoveBookingGuestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GuestInvite($code: String!) {\n    guestInvite(code: $code) {\n      code\n      guestName\n      hostFirstName\n      spaceName\n      condominiumName\n      startsAt\n      endsAt\n      status\n      checkedIn\n    }\n  }\n"): typeof import('./graphql').GuestInviteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment GateGuestFields on GateGuest {\n    id\n    bookingId\n    name\n    documentType\n    document\n    phone\n    code\n    checkedInAt\n    spaceName\n    startsAt\n    endsAt\n    hostName\n    unitLabel\n    checkInWindow\n  }\n"): typeof import('./graphql').GateGuestFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GateGuests($date: String) {\n    gateGuests(date: $date) {\n      ...GateGuestFields\n    }\n  }\n"): typeof import('./graphql').GateGuestsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DayGuests(\n    $date: String\n    $filter: DayGuestFilterInput\n    $page: PageInput\n  ) {\n    dayGuests(date: $date, filter: $filter, page: $page) {\n      items {\n        ...GateGuestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): typeof import('./graphql').DayGuestsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query DayGuestsOverview($date: String) {\n    dayGuestsOverview(date: $date) {\n      total\n      checkedIn\n      bookings\n      guests {\n        id\n        label\n      }\n      hosts {\n        id\n        label\n      }\n      units {\n        id\n        label\n      }\n      spaces {\n        id\n        label\n      }\n    }\n  }\n"): typeof import('./graphql').DayGuestsOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CheckInGuest($input: CheckInGuestInput!) {\n    checkInGuest(input: $input) {\n      ...GateGuestFields\n    }\n  }\n"): typeof import('./graphql').CheckInGuestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UndoGuestCheckIn($guestId: ID!) {\n    undoGuestCheckIn(guestId: $guestId) {\n      ...GateGuestFields\n    }\n  }\n"): typeof import('./graphql').UndoGuestCheckInDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BookingFees($month: String, $filter: FeeFilterInput) {\n    bookingFees(month: $month, filter: $filter) {\n      month\n      totalCents\n      billedCents\n      items {\n        ...BookingFields\n      }\n    }\n  }\n"): typeof import('./graphql').BookingFeesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BookingFeesPage(\n    $month: String\n    $filter: FeeFilterInput\n    $page: PageInput\n  ) {\n    bookingFeesPage(month: $month, filter: $filter, page: $page) {\n      items {\n        ...BookingFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): typeof import('./graphql').BookingFeesPageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BookingFeesOverview($month: String) {\n    bookingFeesOverview(month: $month) {\n      month\n      count\n      totalCents\n      billedCents\n      units {\n        id\n        label\n      }\n      spaces {\n        id\n        label\n      }\n      users {\n        id\n        label\n      }\n    }\n  }\n"): typeof import('./graphql').BookingFeesOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetBookingFeesBilled($input: SetBookingFeesBilledInput!) {\n    setBookingFeesBilled(input: $input)\n  }\n"): typeof import('./graphql').SetBookingFeesBilledDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment BroadcastFields on Broadcast {\n    id\n    title\n    body\n    audience\n    targetGroup\n    sendEmail\n    recipients\n    authorName\n    createdAt\n  }\n"): typeof import('./graphql').BroadcastFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Broadcasts {\n    broadcasts {\n      ...BroadcastFields\n    }\n  }\n"): typeof import('./graphql').BroadcastsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendBroadcast($input: BroadcastInput!) {\n    sendBroadcast(input: $input) {\n      ...BroadcastFields\n    }\n  }\n"): typeof import('./graphql').SendBroadcastDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CondominiumFields on Condominium {\n    id\n    name\n    document\n    city\n    state\n    status\n    addressFormat\n    modules\n    activeMembers\n    managers\n    units\n    pendingEnrollments\n    lastActivityAt\n    createdAt\n  }\n"): typeof import('./graphql').CondominiumFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Condominiums($filter: CondominiumFilterInput) {\n    condominiums(filter: $filter) {\n      ...CondominiumFields\n    }\n  }\n"): typeof import('./graphql').CondominiumsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateCondominium($input: CondominiumInput!) {\n    createCondominium(input: $input) {\n      ...CondominiumFields\n    }\n  }\n"): typeof import('./graphql').CreateCondominiumDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateCondominium($id: ID!, $input: CondominiumInput!) {\n    updateCondominium(id: $id, input: $input) {\n      ...CondominiumFields\n    }\n  }\n"): typeof import('./graphql').UpdateCondominiumDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetCondominiumStatus($id: ID!, $status: CondominiumStatus!) {\n    setCondominiumStatus(id: $id, status: $status) {\n      ...CondominiumFields\n    }\n  }\n"): typeof import('./graphql').SetCondominiumStatusDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetCondominiumModule(\n    $id: ID!\n    $module: AppModule!\n    $enabled: Boolean!\n  ) {\n    setCondominiumModule(id: $id, module: $module, enabled: $enabled) {\n      ...CondominiumFields\n    }\n  }\n"): typeof import('./graphql').SetCondominiumModuleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment UnitFields on Unit {\n    id\n    street\n    block\n    number\n    label\n    residents\n  }\n"): typeof import('./graphql').UnitFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Units {\n    units {\n      ...UnitFields\n    }\n  }\n"): typeof import('./graphql').UnitsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateUnits($input: CreateUnitsInput!) {\n    createUnits(input: $input) {\n      ...UnitFields\n    }\n  }\n"): typeof import('./graphql').CreateUnitsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateUnit($id: ID!, $input: UpdateUnitInput!) {\n    updateUnit(id: $id, input: $input) {\n      ...UnitFields\n    }\n  }\n"): typeof import('./graphql').UpdateUnitDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteUnit($id: ID!) {\n    deleteUnit(id: $id)\n  }\n"): typeof import('./graphql').DeleteUnitDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Condominium($id: ID!) {\n    condominium(id: $id) {\n      ...CondominiumFields\n    }\n  }\n"): typeof import('./graphql').CondominiumDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dashboard {\n    dashboard {\n      activeUsers\n      pendingEnrollments\n      units\n      activeSpaces\n      pendingBookings\n      bookingsToday\n      openSupportRequests\n      failedNotifications\n    }\n  }\n"): typeof import('./graphql').DashboardDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment DependentFields on Dependent {\n    id\n    name\n    birthDate\n    relationship\n    status\n    holderName\n    unitLabel\n    rejectReason\n    reviewedAt\n    createdAt\n    documentUrl\n    documentContentType\n  }\n"): typeof import('./graphql').DependentFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyDependents {\n    myDependents {\n      ...DependentFields\n    }\n  }\n"): typeof import('./graphql').MyDependentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddDependent($input: DependentInput!) {\n    addDependent(input: $input) {\n      ...DependentFields\n    }\n  }\n"): typeof import('./graphql').AddDependentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveDependent($id: ID!) {\n    removeDependent(id: $id)\n  }\n"): typeof import('./graphql').RemoveDependentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dependents($status: DependentStatus) {\n    dependents(status: $status) {\n      ...DependentFields\n    }\n  }\n"): typeof import('./graphql').DependentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApproveDependent($id: ID!) {\n    approveDependent(id: $id) {\n      ...DependentFields\n    }\n  }\n"): typeof import('./graphql').ApproveDependentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectDependent($id: ID!, $reason: String!) {\n    rejectDependent(id: $id, reason: $reason) {\n      ...DependentFields\n    }\n  }\n"): typeof import('./graphql').RejectDependentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation VerifyEnrollmentCode($code: String!) {\n    verifyEnrollmentCode(code: $code)\n  }\n"): typeof import('./graphql').VerifyEnrollmentCodeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EnrollmentForm($formToken: String!) {\n    enrollmentForm(formToken: $formToken) {\n      condominiumName\n      addressFormat\n      units {\n        id\n        label\n      }\n    }\n  }\n"): typeof import('./graphql').EnrollmentFormDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitEnrollment($input: SubmitEnrollmentInput!) {\n    submitEnrollment(input: $input)\n  }\n"): typeof import('./graphql').SubmitEnrollmentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EnrollmentInviteFields on EnrollmentInvite {\n    id\n    code\n    label\n    expiresAt\n    revokedAt\n    createdAt\n    requestCount\n  }\n"): typeof import('./graphql').EnrollmentInviteFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EnrollmentRequestFields on EnrollmentRequest {\n    id\n    status\n    applicant\n    fullName\n    email\n    phone\n    birthDate\n    unitId\n    unitLabel\n    unitComplement\n    typedUnitLabel\n    typedUnitBlock\n    typedUnitNumber\n    typedUnitStreet\n    createdAt\n    reviewedAt\n    rejectionReason\n    userId\n    photoUrl\n  }\n"): typeof import('./graphql').EnrollmentRequestFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EnrollmentInvites {\n    enrollmentInvites {\n      ...EnrollmentInviteFields\n    }\n  }\n"): typeof import('./graphql').EnrollmentInvitesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEnrollmentInvite($input: CreateEnrollmentInviteInput!) {\n    createEnrollmentInvite(input: $input) {\n      ...EnrollmentInviteFields\n    }\n  }\n"): typeof import('./graphql').CreateEnrollmentInviteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RevokeEnrollmentInvite($id: ID!) {\n    revokeEnrollmentInvite(id: $id) {\n      ...EnrollmentInviteFields\n    }\n  }\n"): typeof import('./graphql').RevokeEnrollmentInviteDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EnrollmentRequests(\n    $filter: EnrollmentRequestFilterInput\n    $page: PageInput\n  ) {\n    enrollmentRequests(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...EnrollmentRequestFields\n      }\n    }\n    pendingEnrollmentCount\n  }\n"): typeof import('./graphql').EnrollmentRequestsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApproveEnrollmentRequest(\n    $id: ID!\n    $data: EnrollmentDataInput!\n    $group: UserGroup!\n  ) {\n    approveEnrollmentRequest(id: $id, data: $data, group: $group) {\n      request {\n        ...EnrollmentRequestFields\n      }\n      access {\n        temporaryPassword\n        emailSent\n        existingAccount\n        user {\n          ...UserAccountFields\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').ApproveEnrollmentRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectEnrollmentRequest($id: ID!, $reason: String!) {\n    rejectEnrollmentRequest(id: $id, reason: $reason) {\n      ...EnrollmentRequestFields\n    }\n  }\n"): typeof import('./graphql').RejectEnrollmentRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EventFields on Event {\n    id\n    title\n    description\n    spaceId\n    spaceName\n    location\n    address {\n      zip\n      street\n      number\n      complement\n      district\n      city\n      state\n    }\n    startsAt\n    endsAt\n    capacity\n    externalGuestLimit\n    ticketed\n    fullPriceCents\n    ticketTypes {\n      id\n      kind\n      name\n      priceMode\n      customPriceCents\n      priceCents\n      minAge\n      maxAge\n    }\n    unitTicketLimit\n    salesClose\n    salesCloseHours\n    salesClosesAt\n    pixSource\n    customPix {\n      keyType\n      key\n      name\n      city\n    }\n    placesLeft\n    outsidePlacesLeft\n    status\n    cancelReason\n    publishedAt\n    cancelledAt\n    createdAt\n  }\n"): typeof import('./graphql').EventFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Events($when: EventWhen) {\n    events(when: $when) {\n      ...EventFields\n    }\n  }\n"): typeof import('./graphql').EventsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Event($id: ID!) {\n    event(id: $id) {\n      ...EventFields\n    }\n  }\n"): typeof import('./graphql').EventDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEvent($input: EventInput!) {\n    createEvent(input: $input) {\n      ...EventFields\n    }\n  }\n"): typeof import('./graphql').CreateEventDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateEvent($id: ID!, $input: EventInput!) {\n    updateEvent(id: $id, input: $input) {\n      ...EventFields\n    }\n  }\n"): typeof import('./graphql').UpdateEventDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PublishEvent($id: ID!) {\n    publishEvent(id: $id) {\n      ...EventFields\n    }\n  }\n"): typeof import('./graphql').PublishEventDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelEvent($id: ID!, $reason: String!) {\n    cancelEvent(id: $id, reason: $reason) {\n      ...EventFields\n    }\n  }\n"): typeof import('./graphql').CancelEventDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment EventOrderFields on EventOrder {\n    id\n    eventId\n    eventTitle\n    code\n    status\n    totalCents\n    buyerId\n    buyerName\n    unitId\n    unitLabel\n    attendees {\n      id\n      source\n      dependentId\n      name\n      age\n      outside\n      ticketName\n      priceCents\n      needsProof\n      proofUrl\n      proofContentType\n      ticketCode\n      checkedInAt\n    }\n    pix {\n      keyType\n      key\n      name\n      city\n    }\n    pixCode\n    expiresAt\n    receiptSentAt\n    receiptContentType\n    receiptUrl\n    reviewedAt\n    rejectReason\n    cancelledAt\n    createdAt\n  }\n"): typeof import('./graphql').EventOrderFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyEventOrders($eventId: ID!) {\n    myEventOrders(eventId: $eventId) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').MyEventOrdersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventOrders(\n    $eventId: ID!\n    $filter: EventOrderFilterInput\n    $page: PageInput\n  ) {\n    eventOrders(eventId: $eventId, filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...EventOrderFields\n      }\n    }\n  }\n"): typeof import('./graphql').EventOrdersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateEventOrder($eventId: ID!, $attendees: [AttendeeInput!]!) {\n    createEventOrder(eventId: $eventId, attendees: $attendees) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').CreateEventOrderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitEventOrderReceipt($id: ID!, $file: String!) {\n    submitEventOrderReceipt(id: $id, file: $file) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').SubmitEventOrderReceiptDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CancelEventOrder($id: ID!) {\n    cancelEventOrder(id: $id) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').CancelEventOrderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ApproveEventOrder($id: ID!) {\n    approveEventOrder(id: $id) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').ApproveEventOrderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RejectEventOrder($id: ID!, $reason: String!) {\n    rejectEventOrder(id: $id, reason: $reason) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').RejectEventOrderDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitEventAttendeeProof(\n    $orderId: ID!\n    $attendeeId: ID!\n    $file: String!\n  ) {\n    submitEventAttendeeProof(\n      orderId: $orderId\n      attendeeId: $attendeeId\n      file: $file\n    ) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').SubmitEventAttendeeProofDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment GateEventTicketFields on GateEventTicket {\n    id\n    name\n    age\n    outside\n    source\n    ticketName\n    ticketCode\n    checkedInAt\n    entryWindow\n    eventId\n    eventTitle\n    eventStatus\n    startsAt\n    endsAt\n    placeName\n    orderCode\n    buyerName\n    unitId\n    unitLabel\n  }\n"): typeof import('./graphql').GateEventTicketFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query GateEventTickets($date: String) {\n    gateEventTickets(date: $date) {\n      ...GateEventTicketFields\n    }\n  }\n"): typeof import('./graphql').GateEventTicketsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CheckInEventTicket($input: CheckInEventTicketInput!) {\n    checkInEventTicket(input: $input) {\n      ...GateEventTicketFields\n    }\n  }\n"): typeof import('./graphql').CheckInEventTicketDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UndoEventTicketCheckIn($attendeeId: ID!) {\n    undoEventTicketCheckIn(attendeeId: $attendeeId) {\n      ...GateEventTicketFields\n    }\n  }\n"): typeof import('./graphql').UndoEventTicketCheckInDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventTicketPass($code: String!) {\n    eventTicket(code: $code) {\n      code\n      name\n      ticketName\n      eventTitle\n      placeName\n      condominiumName\n      startsAt\n      endsAt\n      buyerFirstName\n      status\n      checkedIn\n    }\n  }\n"): typeof import('./graphql').EventTicketPassDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventOrdersQueue($status: EventOrderStatus, $eventId: ID) {\n    eventOrdersQueue(status: $status, eventId: $eventId) {\n      ...EventOrderFields\n    }\n  }\n"): typeof import('./graphql').EventOrdersQueueDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventTickets(\n    $eventId: ID!\n    $filter: EventTicketFilterInput\n    $page: PageInput\n  ) {\n    eventTickets(eventId: $eventId, filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        ...GateEventTicketFields\n      }\n    }\n  }\n"): typeof import('./graphql').EventTicketsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventTicketOverview($eventId: ID!) {\n    eventTicketOverview(eventId: $eventId) {\n      total\n      checkedIn\n      outside\n      byType {\n        name\n        count\n      }\n      people {\n        id\n        name\n        ticketCode\n      }\n      units {\n        id\n        label\n      }\n    }\n  }\n"): typeof import('./graphql').EventTicketOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query EventOrderOverview($eventId: ID!) {\n    eventOrderOverview(eventId: $eventId) {\n      byStatus {\n        status\n        count\n      }\n      receivedCents\n      confirmedPeople\n      buyers {\n        id\n        name\n      }\n      units {\n        id\n        label\n      }\n      codes {\n        code\n        buyerName\n      }\n    }\n  }\n"): typeof import('./graphql').EventOrderOverviewDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MyNotifications($unreadOnly: Boolean!, $page: PageInput) {\n    myNotifications(unreadOnly: $unreadOnly, page: $page) {\n      items {\n        id\n        type\n        title\n        body\n        link\n        readAt\n        createdAt\n      }\n      total\n      page\n      totalPages\n    }\n  }\n"): typeof import('./graphql').MyNotificationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query UnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n"): typeof import('./graphql').UnreadNotificationsCountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkNotificationRead($id: ID!) {\n    markNotificationRead(id: $id)\n  }\n"): typeof import('./graphql').MarkNotificationReadDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllNotificationsRead {\n    markAllNotificationsRead\n  }\n"): typeof import('./graphql').MarkAllNotificationsReadDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query NotificationPreferences {\n    myNotificationPreferences {\n      type\n      emailEnabled\n    }\n  }\n"): typeof import('./graphql').NotificationPreferencesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetNotificationPreference(\n    $type: NotificationType!\n    $emailEnabled: Boolean!\n  ) {\n    setNotificationPreference(type: $type, emailEnabled: $emailEnabled) {\n      type\n      emailEnabled\n    }\n  }\n"): typeof import('./graphql').SetNotificationPreferenceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PushPublicKey {\n    pushPublicKey\n  }\n"): typeof import('./graphql').PushPublicKeyDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubscribePush($input: PushSubscriptionInput!) {\n    subscribePush(input: $input)\n  }\n"): typeof import('./graphql').SubscribePushDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnsubscribePush($endpoint: String!) {\n    unsubscribePush(endpoint: $endpoint)\n  }\n"): typeof import('./graphql').UnsubscribePushDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendTestPush {\n    sendTestPush\n  }\n"): typeof import('./graphql').SendTestPushDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CondominiumPix {\n    condominiumPix {\n      keyType\n      key\n      name\n      city\n    }\n  }\n"): typeof import('./graphql').CondominiumPixDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetCondominiumPix($input: PixReceiverInput!) {\n    setCondominiumPix(input: $input) {\n      keyType\n      key\n      name\n      city\n    }\n  }\n"): typeof import('./graphql').SetCondominiumPixDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveCondominiumPix {\n    removeCondominiumPix\n  }\n"): typeof import('./graphql').RemoveCondominiumPixDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlatformMetrics($filter: PlatformMetricsFilterInput) {\n    platformMetrics(filter: $filter) {\n      from\n      to\n      days\n      condominiumId\n      bookings {\n        total\n        confirmed\n        pending\n        cancelled\n        rejected\n        stalePending\n        granularity\n        series {\n          bucket\n          total\n          cancelled\n        }\n        byCondominium {\n          condominiumId\n          name\n          total\n          cancelled\n        }\n      }\n      spaces {\n        activeSpaces\n        unusedCount\n        mostUsed {\n          spaceId\n          name\n          condominiumName\n          bookings\n          hours\n        }\n        unused {\n          spaceId\n          name\n          condominiumName\n          bookings\n          hours\n        }\n        byWeekday {\n          weekday\n          bookings\n        }\n        byHour {\n          hour\n          bookings\n        }\n      }\n      engagement {\n        members\n        active7d\n        active30d\n        newMembers\n        enrollments\n        inactiveCount\n        inactiveCondominiums {\n          condominiumId\n          name\n          lastActivityAt\n        }\n      }\n      health {\n        staleEnrollments\n        failedNotifications\n        delayedNotifications\n        withoutManager\n        withoutUnits\n        openSupport\n      }\n    }\n  }\n"): typeof import('./graphql').PlatformMetricsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query PlatformPeople($filter: PlatformPeopleFilterInput, $page: PageInput) {\n    platformPeople(filter: $filter, page: $page) {\n      total\n      page\n      limit\n      totalPages\n      items {\n        id\n        name\n        email\n        username\n        phone\n        platformAdmin\n        active\n        lockedUntil\n        lastLoginAt\n        createdAt\n        memberships {\n          condominiumId\n          condominiumName\n          role\n          kind\n          active\n        }\n      }\n    }\n  }\n"): typeof import('./graphql').PlatformPeopleDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query CondominiumMembers($condominiumId: ID!) {\n    condominiumMembers(condominiumId: $condominiumId) {\n      userId\n      name\n      email\n      username\n      phone\n      role\n      kind\n      active\n      unitLabel\n      jobTitle\n      lastLoginAt\n      since\n    }\n  }\n"): typeof import('./graphql').CondominiumMembersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SpaceFields on Space {\n    id\n    name\n    kind\n    description\n    capacity\n    usageRules\n    active\n    photos {\n      id\n      url\n    }\n    createdAt\n    updatedAt\n    rules {\n      openingHours {\n        weekday\n        opensAt\n        closesAt\n      }\n      slotMinutes\n      minAdvanceHours\n      maxAdvanceDays\n      unitLimit {\n        count\n        period\n      }\n      requiresApproval\n      cancelUntilHours\n      feeCents\n      guests {\n        allowed\n        max\n        documentRequired\n      }\n      recurringAllowed\n    }\n  }\n"): typeof import('./graphql').SpaceFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Spaces($includeInactive: Boolean!) {\n    spaces(includeInactive: $includeInactive) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').SpacesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Space($id: ID!) {\n    space(id: $id) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').SpaceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateSpace($input: SpaceInput!) {\n    createSpace(input: $input) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').CreateSpaceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSpace($id: ID!, $input: SpaceInput!) {\n    updateSpace(id: $id, input: $input) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').UpdateSpaceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SetSpaceActive($id: ID!, $active: Boolean!) {\n    setSpaceActive(id: $id, active: $active) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').SetSpaceActiveDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation AddSpacePhoto($spaceId: ID!, $photo: String!) {\n    addSpacePhoto(spaceId: $spaceId, photo: $photo) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').AddSpacePhotoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RemoveSpacePhoto($spaceId: ID!, $photoId: ID!) {\n    removeSpacePhoto(spaceId: $spaceId, photoId: $photoId) {\n      ...SpaceFields\n    }\n  }\n"): typeof import('./graphql').RemoveSpacePhotoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteSpace($id: ID!) {\n    deleteSpace(id: $id)\n  }\n"): typeof import('./graphql').DeleteSpaceDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment SupportRequestFields on SupportRequest {\n    id\n    protocol\n    userId\n    userName\n    condominiumName\n    category\n    subject\n    message\n    status\n    reply\n    repliedAt\n    repliedByName\n    finalizedAt\n    finalizedByName\n    createdAt\n  }\n"): typeof import('./graphql').SupportRequestFieldsFragmentDoc;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SupportPage($page: PageInput) {\n    supportQuota {\n      limit\n      sentToday\n      remaining\n      nextAllowedAt\n    }\n    mySupportRequests(page: $page) {\n      items {\n        ...SupportRequestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): typeof import('./graphql').SupportPageDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SupportRequests($status: SupportStatus, $page: PageInput) {\n    supportRequests(status: $status, page: $page) {\n      items {\n        ...SupportRequestFields\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): typeof import('./graphql').SupportRequestsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SendSupportRequest($input: SupportRequestInput!) {\n    sendSupportRequest(input: $input) {\n      ...SupportRequestFields\n    }\n  }\n"): typeof import('./graphql').SendSupportRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReplySupportRequest($id: ID!, $reply: String!) {\n    replySupportRequest(id: $id, reply: $reply) {\n      ...SupportRequestFields\n    }\n  }\n"): typeof import('./graphql').ReplySupportRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation FinalizeSupportRequest($id: ID!) {\n    finalizeSupportRequest(id: $id) {\n      ...SupportRequestFields\n    }\n  }\n"): typeof import('./graphql').FinalizeSupportRequestDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SupportRanking($year: Int) {\n    supportRanking(year: $year) {\n      year\n      supporters\n      totalCents\n      entries {\n        position\n        name\n        totalCents\n        contributions\n      }\n    }\n  }\n"): typeof import('./graphql').SupportRankingDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Supporters {\n    supporters {\n      id\n      name\n      showName\n      totalCents\n      contributions\n      lastReceivedOn\n      history {\n        id\n        amountCents\n        receivedOn\n        note\n      }\n    }\n  }\n"): typeof import('./graphql').SupportersDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RecordSupportContribution($input: RecordSupportContributionInput!) {\n    recordSupportContribution(input: $input) {\n      id\n    }\n  }\n"): typeof import('./graphql').RecordSupportContributionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateSupporter($id: ID!, $input: UpdateSupporterInput!) {\n    updateSupporter(id: $id, input: $input) {\n      id\n    }\n  }\n"): typeof import('./graphql').UpdateSupporterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteSupporter($id: ID!) {\n    deleteSupporter(id: $id)\n  }\n"): typeof import('./graphql').DeleteSupporterDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteSupportContribution($id: ID!) {\n    deleteSupportContribution(id: $id)\n  }\n"): typeof import('./graphql').DeleteSupportContributionDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SystemLogs($filter: SystemLogFilterInput, $page: PageInput) {\n    systemLogs(filter: $filter, page: $page) {\n      items {\n        id\n        level\n        category\n        source\n        message\n        details\n        userId\n        userName\n        ip\n        statusCode\n        durationMs\n        environment\n        createdAt\n      }\n      total\n      page\n      limit\n      totalPages\n    }\n  }\n"): typeof import('./graphql').SystemLogsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SystemLogSummary {\n    systemLogSummary {\n      level\n      last24h\n      last7d\n    }\n  }\n"): typeof import('./graphql').SystemLogSummaryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ReportClientError(\n    $message: String!\n    $url: String!\n    $digest: String\n  ) {\n    reportClientError(message: $message, url: $url, digest: $digest)\n  }\n"): typeof import('./graphql').ReportClientErrorDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
